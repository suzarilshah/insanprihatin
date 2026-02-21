import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects, donationLogs } from '@/db'
import { eq } from 'drizzle-orm'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'
import { headers } from 'next/headers'
import { RateLimiters } from '@/lib/api-rate-limit'
import { enforceTrustedOrigin } from '@/lib/security/request'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'
import { donationLogger as logger } from '@/lib/logger'

/**
 * Payment Retry API
 *
 * SECURITY:
 * - CSRF protection via origin validation
 * - Rate limited to prevent payment gateway abuse
 * Allows users to retry a failed payment without re-entering all their information.
 * Creates a new ToyyibPay bill with the same donation details.
 */

// Helper to get string from LocalizedString
function getProjectTitle(title: unknown): string {
  if (typeof title === 'string') return title
  if (title && typeof title === 'object' && 'en' in title) {
    return getLocalizedValue(title as LocalizedString, 'en')
  }
  return 'Project'
}

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
  // SECURITY: CSRF protection - verify request origin
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Rate limit retry attempts to prevent payment gateway abuse
  const rateLimitResponse = await RateLimiters.donationCreate(request)
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
    const webhookSecret = process.env.TOYYIBPAY_WEBHOOK_SECRET
    const callbackUrl = webhookSecret
      ? `${baseUrl}/api/donations/webhook?token=${encodeURIComponent(webhookSecret)}`
      : `${baseUrl}/api/donations/webhook`

    const requestId = `retry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const operation = logger.startOperation('retryPayment', { requestId, reference: donation.paymentReference })

    logger.info('Payment retry initiated', {
      requestId,
      baseUrl,
      reference: donation.paymentReference,
      attemptNumber: (donation.paymentAttempts || 0) + 1,
      isAnonymous: donation.isAnonymous,
    })

    try {
      // Create new ToyyibPay bill
      const projectTitle = project ? getProjectTitle(project.title) : null
      const billName = projectTitle
        ? `Donation: ${projectTitle}`.substring(0, 30)
        : 'Donation to YIP'.substring(0, 30)

      const billDescription = projectTitle
        ? `Donation for ${projectTitle} (Retry)`.substring(0, 100)
        : 'Donation to Yayasan Insan Prihatin (Retry)'.substring(0, 100)

      // For anonymous donations, use '0' for billPayorInfo to hide payer fields
      const isAnonymous = donation.isAnonymous || !donation.donorName
      const billCode = await ToyyibPayService.createBill({
        categoryCode,
        billName,
        billDescription,
        billPriceSetting: '1',
        billPayorInfo: isAnonymous ? '0' : '1', // Hide payer info for anonymous
        billAmount: donation.amount,
        billReturnUrl: successUrl,
        billCallbackUrl: callbackUrl,
        billExternalReferenceNo: donation.paymentReference || reference,
        billTo: isAnonymous ? 'Penderma' : (donation.donorName || 'Penderma'),
        billEmail: donation.donorEmail || 'donor@yayasaninsanprihatin.org',
        billPhone: donation.donorPhone || '0123456789', // Valid format placeholder
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

      operation.success('Retry bill created', { billCode, paymentUrl })
      logger.info('Payment retry bill created successfully', {
        requestId,
        billCode,
        paymentUrl,
        attemptNumber: (donation.paymentAttempts || 0) + 1,
      })

      return NextResponse.json({
        success: true,
        message: 'Payment retry initiated',
        redirectUrl: paymentUrl,
        attemptNumber: (donation.paymentAttempts || 0) + 1,
        reference: donation.paymentReference,
      })

    } catch (error) {
      operation.failure(error instanceof Error ? error : new Error('Retry bill creation failed'))
      logger.error('Retry bill creation error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof ToyyibPayError ? error.code : 'UNKNOWN',
      })

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
    logger.error('Payment retry error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Failed to process retry request' },
      { status: 500 }
    )
  }
}
