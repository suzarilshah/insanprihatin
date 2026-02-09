import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects, donationLogs } from '@/db'
import { eq } from 'drizzle-orm'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'
import { headers } from 'next/headers'
import { RateLimiters } from '@/lib/api-rate-limit'

/**
 * Payment Retry API
 *
 * SECURITY: Rate limited to prevent payment gateway abuse.
 * Allows users to retry a failed payment without re-entering all their information.
 * Creates a new ToyyibPay bill with the same donation details.
 */

// Get base URL dynamically from request or environment
function getBaseUrl(request?: NextRequest): string {
  if (request) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    if (host) {
      return `${protocol}://${host}`
    }
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  // SECURITY: Rate limit retry attempts to prevent payment gateway abuse
  const rateLimitResponse = RateLimiters.donationCreate(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Find the original donation
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Only allow retry for failed or pending payments
    if (donation.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'This payment has already been completed' },
        { status: 400 }
      )
    }

    if (donation.paymentStatus === 'refunded') {
      return NextResponse.json(
        { error: 'This payment has been refunded' },
        { status: 400 }
      )
    }

    // Limit retry attempts
    const maxAttempts = 5
    if ((donation.paymentAttempts || 0) >= maxAttempts) {
      return NextResponse.json(
        { error: `Maximum retry attempts (${maxAttempts}) reached. Please start a new donation.` },
        { status: 400 }
      )
    }

    // Check if ToyyibPay is configured
    if (!ToyyibPayService.isConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured' },
        { status: 500 }
      )
    }

    // Get project details if donation is for a specific project
    let project = null
    let categoryCode: string | null = null

    if (donation.projectId) {
      project = await db.query.projects.findFirst({
        where: eq(projects.id, donation.projectId),
      })

      if (project) {
        categoryCode = project.toyyibpayCategoryCode
      }
    }

    // Get or create category code
    if (!categoryCode) {
      categoryCode = await ToyyibPayService.getOrCreateGeneralFundCategory()
    }

    // Generate URLs dynamically
    const baseUrl = getBaseUrl(request)
    const successUrl = `${baseUrl}/donate/success?ref=${donation.paymentReference}`
    const callbackUrl = `${baseUrl}/api/donations/webhook`

    console.log('[Retry] Base URL configuration:', {
      baseUrl,
      reference: donation.paymentReference,
      attemptNumber: (donation.paymentAttempts || 0) + 1,
    })

    try {
      // Create new ToyyibPay bill
      const billName = project
        ? `Donation: ${project.title}`.substring(0, 30)
        : 'Donation to YIP'.substring(0, 30)

      const billDescription = project
        ? `Donation for ${project.title} (Retry)`.substring(0, 100)
        : 'Donation to Yayasan Insan Prihatin (Retry)'.substring(0, 100)

      const billCode = await ToyyibPayService.createBill({
        categoryCode,
        billName,
        billDescription,
        billPriceSetting: '1',
        billPayorInfo: '1',
        billAmount: donation.amount,
        billReturnUrl: successUrl,
        billCallbackUrl: callbackUrl,
        billExternalReferenceNo: donation.paymentReference || reference, // Use same reference
        billTo: donation.donorName || 'Anonymous Donor',
        billEmail: donation.donorEmail || 'donor@yayasaninsanprihatin.org',
        billPhone: donation.donorPhone || '0000000000',
        billPaymentChannel: '0',
        billChargeToCustomer: '1',
      })

      // Update donation with new bill code and increment attempts
      const headersList = await headers()
      await db
        .update(donations)
        .set({
          toyyibpayBillCode: billCode,
          paymentAttempts: (donation.paymentAttempts || 0) + 1,
          paymentStatus: 'pending', // Reset to pending
          failureReason: null, // Clear failure reason
          ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || donation.ipAddress,
          userAgent: headersList.get('user-agent') || donation.userAgent,
        })
        .where(eq(donations.id, donation.id))

      // Log retry attempt
      await db.insert(donationLogs).values({
        donationId: donation.id,
        eventType: 'retry_initiated',
        eventData: {
          attemptNumber: (donation.paymentAttempts || 0) + 1,
          previousBillCode: donation.toyyibpayBillCode,
          newBillCode: billCode,
        },
        ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
      })

      // Get payment URL
      const paymentUrl = ToyyibPayService.getPaymentUrl(billCode)

      return NextResponse.json({
        success: true,
        message: 'Payment retry initiated',
        redirectUrl: paymentUrl,
        attemptNumber: (donation.paymentAttempts || 0) + 1,
        reference: donation.paymentReference,
      })

    } catch (error) {
      console.error('Retry bill creation error:', error)

      // Log error
      await db.insert(donationLogs).values({
        donationId: donation.id,
        eventType: 'retry_error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof ToyyibPayError ? error.code : 'UNKNOWN',
        },
      })

      return NextResponse.json(
        {
          error: 'Failed to initiate payment retry. Please try again.',
          details: error instanceof ToyyibPayError ? error.message : undefined,
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Payment retry error:', error)
    return NextResponse.json(
      { error: 'Failed to process retry request' },
      { status: 500 }
    )
  }
}
