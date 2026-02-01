import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects, donationLogs } from '@/db'
import { eq, desc, sql } from 'drizzle-orm'
import { notifyDonationReceived } from '@/lib/actions/notifications'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'
import { headers } from 'next/headers'

/**
 * Donation API Routes
 *
 * Security measures:
 * - Server-side only ToyyibPay API calls
 * - Input validation and sanitization
 * - Rate limiting (via middleware)
 * - Secure logging (no API keys in logs)
 * - Session tracking for fraud prevention
 */

// Get base URL dynamically from request or environment
function getBaseUrl(request?: NextRequest): string {
  // Try to get from request headers first (most accurate for current environment)
  if (request) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    if (host) {
      return `${protocol}://${host}`
    }
  }

  // Fall back to environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Default to localhost
  return 'http://localhost:3000'
}

// Generate a unique session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

// Generate a payment reference
function generatePaymentReference(): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `YIP-${timestamp}-${randomPart}`
}

// Log donation event
async function logDonationEvent(
  donationId: string,
  eventType: string,
  eventData?: Record<string, unknown>,
  request?: NextRequest
) {
  try {
    const headersList = request ? await headers() : null
    await db.insert(donationLogs).values({
      donationId,
      eventType,
      eventData: eventData || {},
      ipAddress: headersList?.get('x-forwarded-for') || headersList?.get('x-real-ip') || 'unknown',
      userAgent: headersList?.get('user-agent') || 'unknown',
    })
  } catch (error) {
    console.error('Failed to log donation event:', error)
  }
}

// GET - Fetch donation stats or single donation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const stats = searchParams.get('stats')

    // Get donation stats for admin dashboard
    if (stats === 'true') {
      const statsData = await db.select({
        total: sql<number>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
        completed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'pending')`,
        failed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'failed')`,
        avgAmount: sql<number>`COALESCE(AVG(amount) FILTER (WHERE payment_status = 'completed'), 0)`,
      }).from(donations)

      return NextResponse.json({
        success: true,
        stats: {
          totalRaised: Number(statsData[0].total) / 100,
          totalDonations: Number(statsData[0].count),
          completedDonations: Number(statsData[0].completed),
          pendingDonations: Number(statsData[0].pending),
          failedDonations: Number(statsData[0].failed),
          averageAmount: Number(statsData[0].avgAmount) / 100,
          successRate: statsData[0].count > 0
            ? (Number(statsData[0].completed) / Number(statsData[0].count) * 100).toFixed(1)
            : 0,
        },
      })
    }

    // Fetch single donation by reference
    if (reference) {
      const donation = await db.query.donations.findFirst({
        where: eq(donations.paymentReference, reference),
      })

      if (!donation) {
        return NextResponse.json(
          { error: 'Donation not found' },
          { status: 404 }
        )
      }

      // Get project info if donation is for a specific project
      let projectInfo = null
      if (donation.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, donation.projectId),
        })
        if (project) {
          projectInfo = {
            id: project.id,
            title: project.title,
            slug: project.slug,
          }
        }
      }

      return NextResponse.json({
        success: true,
        donation: {
          id: donation.id,
          donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
          donorEmail: donation.isAnonymous ? null : donation.donorEmail,
          amount: donation.amount / 100,
          currency: donation.currency,
          status: donation.paymentStatus,
          reference: donation.paymentReference,
          receiptNumber: donation.receiptNumber,
          message: donation.message,
          project: projectInfo,
          createdAt: donation.createdAt,
          completedAt: donation.completedAt,
        },
      })
    }

    return NextResponse.json({ error: 'Reference parameter required' }, { status: 400 })
  } catch (error) {
    console.error('Donation fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

// POST - Create new donation and initiate payment
export async function POST(request: NextRequest) {
  const requestId = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Donation ${requestId}] New donation request received`)
  console.log(`${'='.repeat(60)}`)

  try {
    const body = await request.json()
    console.log(`[Donation ${requestId}] Request body:`, {
      amount: body.amount,
      currency: body.currency,
      projectId: body.projectId,
      isAnonymous: body.isAnonymous,
      donorEmail: body.donorEmail ? '***@***' : null,
    })
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency = 'MYR',
      projectId,
      program,
      message,
      isAnonymous = false,
      donationType = 'one-time',
    } = body

    // ===== INPUT VALIDATION =====

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'A valid donation amount is required' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum donation amount is RM 1' },
        { status: 400 }
      )
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: 'Maximum donation amount is RM 100,000. Please contact us for larger donations.' },
        { status: 400 }
      )
    }

    // Validate donor info for non-anonymous donations
    if (!isAnonymous && (!donorName || !donorEmail)) {
      return NextResponse.json(
        { error: 'Name and email are required for non-anonymous donations' },
        { status: 400 }
      )
    }

    // Validate email format
    if (donorEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(donorEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Validate phone format (if provided)
    if (donorPhone) {
      const phoneRegex = /^[\d\s\-+()]{8,20}$/
      if (!phoneRegex.test(donorPhone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }
    }

    // ===== PROJECT VALIDATION =====

    let project = null
    let categoryCode: string | null = null

    if (projectId) {
      project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      if (!project.donationEnabled) {
        return NextResponse.json(
          { error: 'Donations are not enabled for this project' },
          { status: 400 }
        )
      }

      categoryCode = project.toyyibpayCategoryCode
    }

    // ===== GENERATE REFERENCES =====

    const sessionId = generateSessionId()
    const paymentReference = generatePaymentReference()
    const headersList = await headers()

    // ===== CREATE DONATION RECORD =====

    const amountInCents = Math.round(amount * 100)

    // Detect ToyyibPay environment (sandbox vs production)
    const paymentEnvironment = ToyyibPayService.isConfigured()
      ? ToyyibPayService.getEnvironment()
      : 'production'

    const [donation] = await db.insert(donations).values({
      donorName: isAnonymous ? 'Anonymous' : donorName,
      donorEmail: donorEmail || null,
      donorPhone: donorPhone || null,
      amount: amountInCents,
      currency,
      projectId: projectId || null,
      message: message ? `[${program || 'General'}] ${message}` : (program ? `[${program}]` : null),
      isAnonymous,
      paymentStatus: 'pending',
      paymentReference,
      paymentAttempts: 1,
      environment: paymentEnvironment, // Track sandbox vs production
      sessionId,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null,
      userAgent: headersList.get('user-agent') || null,
    }).returning()

    // Log donation created
    await logDonationEvent(donation.id, 'created', {
      amount,
      currency,
      projectId,
      isAnonymous,
      donationType,
    }, request)

    // ===== TOYYIBPAY INTEGRATION =====

    // Get base URL dynamically - uses request origin for localhost testing
    const baseUrl = getBaseUrl(request)
    const successUrl = `${baseUrl}/donate/success?ref=${paymentReference}`
    const failedUrl = `${baseUrl}/donate/failed?ref=${paymentReference}`
    const callbackUrl = `${baseUrl}/api/donations/webhook`

    // Log the URLs being used for debugging
    console.log('[Donation] Base URL configuration:', {
      baseUrl,
      successUrl,
      callbackUrl,
      timestamp: new Date().toISOString(),
    })

    // Check if ToyyibPay is configured
    if (ToyyibPayService.isConfigured()) {
      try {
        // Get or create category code
        if (!categoryCode) {
          // Use General Fund category for non-project donations
          categoryCode = await ToyyibPayService.getOrCreateGeneralFundCategory()
        }

        // Create bill name (max 30 chars)
        const billName = project
          ? `Donation: ${project.title}`.substring(0, 30)
          : 'Donation to YIP'.substring(0, 30)

        // Create bill description (max 100 chars)
        const billDescription = project
          ? `Donation for ${project.title} - ${program || 'General'}`.substring(0, 100)
          : `Donation to Yayasan Insan Prihatin - ${program || 'General Fund'}`.substring(0, 100)

        // Create ToyyibPay bill
        const billCode = await ToyyibPayService.createBill({
          categoryCode,
          billName,
          billDescription,
          billPriceSetting: '1', // Fixed price
          billPayorInfo: '1', // Require payer info
          billAmount: amountInCents, // Amount in cents
          billReturnUrl: successUrl,
          billCallbackUrl: callbackUrl,
          billExternalReferenceNo: paymentReference,
          billTo: isAnonymous ? 'Anonymous Donor' : donorName,
          billEmail: donorEmail || 'donor@yayasaninsanprihatin.org',
          billPhone: donorPhone || '0000000000',
          billContentEmail: `Thank you for your donation of RM ${amount.toFixed(2)} to Yayasan Insan Prihatin.${project ? ` This donation supports: ${project.title}` : ''}`,
          billPaymentChannel: '0', // FPX only
          billChargeToCustomer: '1', // Charge fee to customer
        })

        // Update donation with bill code
        await db
          .update(donations)
          .set({ toyyibpayBillCode: billCode })
          .where(eq(donations.id, donation.id))

        // Log bill created
        await logDonationEvent(donation.id, 'bill_created', {
          billCode,
          categoryCode,
          toyyibpayUrl: ToyyibPayService.getBaseUrl(),
        }, request)

        // Get payment URL
        const paymentUrl = ToyyibPayService.getPaymentUrl(billCode)

        console.log(`[Donation ${requestId}] Bill created successfully`)
        console.log(`[Donation ${requestId}] Bill code: ${billCode}`)
        console.log(`[Donation ${requestId}] Payment URL: ${paymentUrl}`)
        console.log(`${'='.repeat(60)}\n`)

        return NextResponse.json({
          success: true,
          message: 'Donation initiated successfully',
          donationId: donation.id,
          paymentReference,
          redirectUrl: paymentUrl,
          paymentMethod: 'toyyibpay',
        })

      } catch (error) {
        console.error(`[Donation ${requestId}] ToyyibPay error:`, error)
        console.error(`[Donation ${requestId}] Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof ToyyibPayError ? error.code : 'UNKNOWN',
        })

        // Log error
        await logDonationEvent(donation.id, 'error', {
          error: error instanceof Error ? error.message : 'Unknown ToyyibPay error',
          code: error instanceof ToyyibPayError ? error.code : 'UNKNOWN',
        }, request)

        // Return error to user
        return NextResponse.json(
          {
            error: 'Failed to initialize payment gateway. Please try again.',
            details: error instanceof ToyyibPayError ? error.message : undefined,
          },
          { status: 500 }
        )
      }
    }

    // ===== FALLBACK: MANUAL PAYMENT =====

    // If no payment gateway configured, return manual payment flow
    await logDonationEvent(donation.id, 'manual_payment', {
      reason: 'ToyyibPay not configured',
    }, request)

    return NextResponse.json({
      success: true,
      message: 'Donation recorded successfully',
      donationId: donation.id,
      paymentReference,
      redirectUrl: successUrl,
      paymentMethod: 'manual',
      bankDetails: {
        bankName: 'Maybank',
        accountNumber: '5123-4567-8910',
        accountName: 'Yayasan Insan Prihatin',
        reference: paymentReference,
      },
    })

  } catch (error) {
    console.error(`[Donation] Error processing donation:`, error)
    console.error(`[Donation] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again.' },
      { status: 500 }
    )
  }
}

// PATCH - Update donation status (for admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, status, reason } = body

    if (!reference || !status) {
      return NextResponse.json(
        { error: 'Reference and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Find donation
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      paymentStatus: status,
    }

    if (status === 'completed' && !donation.completedAt) {
      updateData.completedAt = new Date()
    }

    if (status === 'failed' && reason) {
      updateData.failureReason = reason
    }

    // Update donation
    await db
      .update(donations)
      .set(updateData)
      .where(eq(donations.paymentReference, reference))

    // Log status change
    await logDonationEvent(donation.id, 'status_updated', {
      previousStatus: donation.paymentStatus,
      newStatus: status,
      reason,
      source: 'admin',
    }, request)

    // If completed and has project, update project raised amount
    if (status === 'completed' && donation.projectId) {
      await db
        .update(projects)
        .set({
          donationRaised: sql`COALESCE(donation_raised, 0) + ${donation.amount}`,
        })
        .where(eq(projects.id, donation.projectId))
    }

    return NextResponse.json({
      success: true,
      message: 'Donation status updated',
    })

  } catch (error) {
    console.error('Donation update error:', error)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}
