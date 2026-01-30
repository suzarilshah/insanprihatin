import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects } from '@/db'
import { eq } from 'drizzle-orm'
import { notifyDonationReceived } from '@/lib/actions/notifications'

/**
 * Webhook handler for payment gateway callbacks (Toyyibpay, Stripe, etc.)
 *
 * This endpoint will be called by the payment provider when a payment is confirmed.
 * Each payment provider has different payload formats, so this handler should be
 * adapted to the specific provider being used.
 *
 * Toyyibpay Webhook Reference:
 * - URL: https://toyyibpay.com/apireference
 * - Callback URL: POST /api/donations/webhook
 * - Expected fields: refno, status, reason, billcode, order_id
 *
 * Common webhook flow:
 * 1. Verify webhook signature (if provided by payment gateway)
 * 2. Find the donation by payment reference
 * 3. Update payment status
 * 4. Trigger admin notification
 * 5. Optionally send confirmation email to donor
 */

// Toyyibpay status codes
const TOYYIBPAY_STATUS = {
  SUCCESS: '1',
  PENDING: '2',
  FAILED: '3',
}

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    // Toyyibpay sends form-urlencoded data
    const contentType = request.headers.get('content-type') || ''

    let webhookData: Record<string, string> = {}

    if (contentType.includes('application/json')) {
      webhookData = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        webhookData[key] = value.toString()
      })
    } else {
      // Try to parse as text and then as URL params
      const text = await request.text()
      const params = new URLSearchParams(text)
      params.forEach((value, key) => {
        webhookData[key] = value
      })
    }

    console.log('Donation webhook received:', webhookData)

    // Extract fields based on payment provider
    // Toyyibpay fields: refno, status, reason, billcode, order_id
    // Generic fields: payment_reference, status, amount
    const paymentReference =
      webhookData.refno ||
      webhookData.payment_reference ||
      webhookData.reference ||
      webhookData.order_id

    const paymentStatus =
      webhookData.status ||
      webhookData.payment_status

    if (!paymentReference) {
      console.error('Missing payment reference in webhook')
      return NextResponse.json(
        { error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    // Find the donation by payment reference
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, paymentReference),
    })

    if (!donation) {
      console.error(`Donation not found for reference: ${paymentReference}`)
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Map payment status
    let newStatus: 'pending' | 'completed' | 'failed' = 'pending'

    // Toyyibpay status mapping
    if (paymentStatus === TOYYIBPAY_STATUS.SUCCESS || paymentStatus === 'success' || paymentStatus === 'paid') {
      newStatus = 'completed'
    } else if (paymentStatus === TOYYIBPAY_STATUS.FAILED || paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      newStatus = 'failed'
    }

    // Update donation status
    await db
      .update(donations)
      .set({ paymentStatus: newStatus })
      .where(eq(donations.id, donation.id))

    // If payment is successful, create admin notification
    if (newStatus === 'completed') {
      // Get project title if donation is for a specific project
      let projectTitle: string | undefined
      if (donation.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, donation.projectId),
        })
        projectTitle = project?.title
      }

      // Create notification
      await notifyDonationReceived({
        donationId: donation.id,
        donorName: donation.isAnonymous ? undefined : donation.donorName || undefined,
        amount: donation.amount / 100, // Convert from cents
        currency: donation.currency || 'MYR',
        projectTitle,
        paymentReference,
      })

      console.log(`Donation notification created for ${paymentReference}`)
    }

    // Return success response
    // Toyyibpay expects specific response format
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      status: newStatus,
    })

  } catch (error) {
    console.error('Donation webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Also handle GET for webhook verification (some payment providers use GET for verification)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge') || searchParams.get('hub.challenge')

  // Return challenge for webhook verification
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Donation webhook endpoint is active',
  })
}
