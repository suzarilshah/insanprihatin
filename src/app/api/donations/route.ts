import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects, donationLogs, siteSettings } from '@/db'
import { eq, desc, sql } from 'drizzle-orm'
import { notifyDonationReceived } from '@/lib/actions/notifications'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'
import { headers } from 'next/headers'
import { RateLimiters } from '@/lib/api-rate-limit'
import { requireAuth } from '@/lib/auth/server'
import { enforceTrustedOrigin } from '@/lib/security/request'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'
import { donationLogger as logger } from '@/lib/logger'

// Helper to get string from LocalizedString
function getProjectTitle(title: unknown): string {
  if (typeof title === 'string') return title
  if (title && typeof title === 'object' && 'en' in title) {
    return getLocalizedValue(title as LocalizedString, 'en')
  }
  return 'Project'
}

/**
 * Donation API Routes
 *
 * Security measures:
 * - Server-side only ToyyibPay API calls
 * - Input validation and sanitization
 * - Rate limiting on donation creation
 * - Secure logging (no API keys in logs)
 * - Session tracking for fraud prevention
 * - Authentication required for admin operations (stats, PATCH)
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

// Check if donations are closed
async function isDonationsClosed(): Promise<boolean> {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'donationsClosed'),
    })
    if (!setting?.value) return false
    const value = setting.value as { closed?: boolean }
    return value.closed === true
  } catch {
    return false // Default to open if query fails
  }
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
    logger.error('Failed to log donation event', { error: error instanceof Error ? error.message : 'Unknown error', donationId })
  }
}

// GET - Fetch donation stats or single donation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const stats = searchParams.get('stats')

    // Get donation stats for admin dashboard
    // SECURITY: Stats require authentication
    if (stats === 'true') {
      try {
        await requireAuth()
      } catch {
        return NextResponse.json(
          { error: 'Authentication required to view donation statistics' },
          { status: 401 }
        )
      }

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
    logger.error('Donation fetch error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

// POST - Create new donation and initiate payment
export async function POST(request: NextRequest) {
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Rate limit donation creation to prevent abuse
  const rateLimitResponse = await RateLimiters.donationCreate(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Check if donations are closed by admin
  if (await isDonationsClosed()) {
    return NextResponse.json(
      { error: 'Donations are currently closed. Please check back later.', code: 'DONATIONS_CLOSED' },
      { status: 403 }
    )
  }

  const requestId = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const operation = logger.startOperation('createDonation', { requestId })

  try {
    const body = await request.json()
    logger.request(requestId, 'Processing donation request', {
      amount: body.amount,
      currency: body.currency,
      projectId: body.projectId,
      isAnonymous: body.isAnonymous,
      hasEmail: !!body.donorEmail,
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
    const webhookSecret = process.env.TOYYIBPAY_WEBHOOK_SECRET
    const callbackUrl = webhookSecret
      ? `${baseUrl}/api/donations/webhook?token=${encodeURIComponent(webhookSecret)}`
      : `${baseUrl}/api/donations/webhook`

    // Log the URLs being used for debugging
    logger.debug('Base URL configuration', {
      requestId,
      baseUrl,
      successUrl,
      callbackUrl,
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
        const projectTitle = project ? getProjectTitle(project.title) : null
        const billName = projectTitle
          ? `Donation: ${projectTitle}`.substring(0, 30)
          : 'Donation to YIP'.substring(0, 30)

        // Create bill description (max 100 chars)
        const billDescription = projectTitle
          ? `Donation for ${projectTitle} - ${program || 'General'}`.substring(0, 100)
          : `Donation to Yayasan Insan Prihatin - ${program || 'General Fund'}`.substring(0, 100)

        // Create ToyyibPay bill
        // For anonymous donations, use '0' for billPayorInfo to hide payer fields
        // and provide placeholder values that ToyyibPay will accept
        const billCode = await ToyyibPayService.createBill({
          categoryCode,
          billName,
          billDescription,
          billPriceSetting: '1', // Fixed price
          billPayorInfo: isAnonymous ? '0' : '1', // Hide payer info for anonymous
          billAmount: amountInCents, // Amount in cents
          billReturnUrl: successUrl,
          billCallbackUrl: callbackUrl,
          billExternalReferenceNo: paymentReference,
          billTo: isAnonymous ? 'Penderma' : donorName, // Use 'Penderma' (Donor in Malay) for anonymous
          billEmail: donorEmail,
          billPhone: donorPhone || '0123456789', // Use valid format placeholder
          billContentEmail: `Thank you for your donation of RM ${amount.toFixed(2)} to Yayasan Insan Prihatin.${projectTitle ? ` This donation supports: ${projectTitle}` : ''}`,
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

        operation.success('Bill created', { billCode, paymentUrl })
        logger.info('Bill created successfully', {
          requestId,
          billCode,
          paymentUrl,
          amount,
          isAnonymous,
        })

        return NextResponse.json({
          success: true,
          message: 'Donation initiated successfully',
          donationId: donation.id,
          paymentReference,
          redirectUrl: paymentUrl,
          paymentMethod: 'toyyibpay',
        })

      } catch (error) {
        const errorCode = error instanceof ToyyibPayError ? error.code : 'UNKNOWN'
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorDetails = error instanceof ToyyibPayError ? error.details : undefined

        operation.failure(error instanceof Error ? error : new Error(errorMessage))
        logger.error('ToyyibPay error during donation', {
          requestId,
          errorCode,
          errorMessage,
          errorDetails: errorDetails ? String(errorDetails) : undefined,
        })

        // Log error
        await logDonationEvent(donation.id, 'error', {
          error: errorMessage,
          code: errorCode,
          details: errorDetails ? String(errorDetails) : undefined,
        }, request)

        // Provide specific error messages based on error code
        let userMessage = 'Failed to initialize payment gateway. Please try again.'
        if (errorCode === 'DATABASE_ERROR') {
          userMessage = 'A temporary database error occurred. Please try again in a moment.'
        } else if (errorCode === 'NOT_CONFIGURED') {
          userMessage = 'Payment system is not configured. Please contact support.'
        } else if (errorCode === 'CATEGORY_CREATE_FAILED' || errorCode === 'BILL_CREATE_FAILED') {
          userMessage = 'Unable to create payment. Please try again or contact support.'
        } else if (errorCode === 'API_ERROR') {
          userMessage = 'Payment gateway returned an error. Please try again.'
        }

        return NextResponse.json(
          {
            error: userMessage,
            details: error instanceof ToyyibPayError ? errorMessage : undefined,
            code: errorCode,
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
    operation.failure(error instanceof Error ? error : new Error('Unknown error'))
    logger.error('Error processing donation', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
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
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Require admin authentication for status updates
  try {
    await requireAuth()
  } catch {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

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
    logger.error('Donation update error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}
