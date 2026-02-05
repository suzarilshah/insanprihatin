import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects, donationLogs } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { notifyDonationReceived } from '@/lib/actions/notifications'
import { ToyyibPayService, TOYYIBPAY_STATUS } from '@/lib/toyyibpay'
import { headers } from 'next/headers'
import { sendDonationReceiptEmail } from '@/lib/email'
import { getReceiptData } from '@/lib/receipt'
import { ReceiptPDF } from '@/lib/receipt-pdf'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

/**
 * ToyyibPay Webhook Handler
 *
 * This endpoint receives payment callbacks from ToyyibPay.
 * It's called automatically when a payment is completed, failed, or cancelled.
 *
 * ToyyibPay Callback Reference:
 * - URL: https://toyyibpay.com/apireference
 * - Method: POST (form-urlencoded)
 * - Expected fields: refno, status, reason, billcode, order_id, amount, transaction_id
 *
 * Status codes:
 * - 1: Success
 * - 2: Pending
 * - 3: Failed
 *
 * Security notes:
 * - ToyyibPay doesn't provide webhook signature verification
 * - We verify the payment by checking our database records
 * - All callbacks are logged for audit trail
 */

// Generate receipt number
function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `YIP-${year}-${random}`
}

// Log webhook event
async function logWebhookEvent(
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
      ipAddress: headersList?.get('x-forwarded-for') || headersList?.get('x-real-ip') || 'webhook',
      userAgent: headersList?.get('user-agent') || 'ToyyibPay-Callback',
    })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}

// POST - Handle ToyyibPay webhook callback
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Webhook ${requestId}] ToyyibPay callback received`)
  console.log(`${'='.repeat(60)}`)

  try {
    // ===== PARSE WEBHOOK PAYLOAD =====

    const contentType = request.headers.get('content-type') || ''
    let webhookData: Record<string, string> = {}

    console.log(`[Webhook ${requestId}] Content-Type: ${contentType}`)

    if (contentType.includes('application/json')) {
      webhookData = await request.json()
      console.log(`[Webhook ${requestId}] Parsed as JSON`)
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        webhookData[key] = value.toString()
      })
      console.log(`[Webhook ${requestId}] Parsed as form-urlencoded`)
    } else {
      // Try to parse as URL params (ToyyibPay sometimes sends this way)
      const text = await request.text()
      const params = new URLSearchParams(text)
      params.forEach((value, key) => {
        webhookData[key] = value
      })
      console.log(`[Webhook ${requestId}] Parsed as URL params`)
    }

    // Log raw webhook data for debugging
    console.log(`[Webhook ${requestId}] Payload:`, {
      timestamp: new Date().toISOString(),
      refno: webhookData.refno,
      status: webhookData.status,
      reason: webhookData.reason,
      billcode: webhookData.billcode,
      order_id: webhookData.order_id,
      amount: webhookData.amount,
      transaction_id: webhookData.transaction_id,
    })

    // ===== EXTRACT CALLBACK DATA =====

    // ToyyibPay callback fields
    const paymentReference =
      webhookData.order_id || // billExternalReferenceNo
      webhookData.refno ||
      webhookData.payment_reference ||
      webhookData.reference

    const paymentStatus = webhookData.status
    const billCode = webhookData.billcode || webhookData.bill_code
    const transactionId = webhookData.transaction_id || webhookData.transactionId
    const reason = webhookData.reason
    const amount = webhookData.amount

    // Validate required fields
    if (!paymentReference) {
      console.error(`[Webhook ${requestId}] Missing payment reference in payload`)
      console.error(`[Webhook ${requestId}] Full payload:`, webhookData)
      return NextResponse.json(
        { error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    console.log(`[Webhook ${requestId}] Payment reference: ${paymentReference}`)

    // ===== FIND DONATION =====

    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, paymentReference),
    })

    if (!donation) {
      console.error(`[Webhook ${requestId}] Donation not found for reference: ${paymentReference}`)
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    console.log(`[Webhook ${requestId}] Found donation: ${donation.id}`)
    console.log(`[Webhook ${requestId}] Current DB status: ${donation.paymentStatus}`)

    // Log callback received
    await logWebhookEvent(donation.id, 'callback_received', {
      webhookData: {
        status: paymentStatus,
        billcode: billCode,
        transactionId,
        reason,
        amount,
      },
    }, request)

    // ===== SKIP IF ALREADY PROCESSED =====

    // If donation is already completed or failed, skip processing
    // This prevents duplicate processing of webhooks
    if (donation.paymentStatus === 'completed' || donation.paymentStatus === 'refunded') {
      console.log(`[Webhook ${requestId}] Donation already processed (${donation.paymentStatus}), skipping`)
      return NextResponse.json({
        success: true,
        message: 'Already processed',
        status: donation.paymentStatus,
      })
    }

    // ===== MAP PAYMENT STATUS =====

    const newStatus = ToyyibPayService.mapPaymentStatus(paymentStatus)
    console.log(`[Webhook ${requestId}] ToyyibPay status '${paymentStatus}' mapped to '${newStatus}'`)

    // ===== UPDATE DONATION =====

    const updateData: Record<string, unknown> = {
      paymentStatus: newStatus,
    }

    // Store ToyyibPay transaction ID if provided
    if (transactionId) {
      updateData.toyyibpayTransactionId = transactionId
    }

    // If payment succeeded
    if (newStatus === 'completed') {
      updateData.completedAt = new Date()
      updateData.receiptNumber = generateReceiptNumber()
    }

    // If payment failed
    if (newStatus === 'failed') {
      updateData.failureReason = reason
        ? ToyyibPayService.getFailureReason(reason)
        : 'Payment was not completed'
    }

    // Perform update
    await db
      .update(donations)
      .set(updateData)
      .where(eq(donations.id, donation.id))

    // Log status update
    await logWebhookEvent(donation.id, 'status_updated', {
      previousStatus: donation.paymentStatus,
      newStatus,
      reason,
      transactionId,
      receiptNumber: updateData.receiptNumber,
    }, request)

    // ===== POST-PAYMENT ACTIONS =====

    if (newStatus === 'completed') {
      // Update project raised amount if donation is for a specific project
      if (donation.projectId) {
        await db
          .update(projects)
          .set({
            donationRaised: sql`COALESCE(donation_raised, 0) + ${donation.amount}`,
          })
          .where(eq(projects.id, donation.projectId))

        console.log(`Updated project ${donation.projectId} raised amount: +${donation.amount / 100}`)
      }

      // Get project title if donation is for a specific project
      let projectTitle: string | undefined
      if (donation.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, donation.projectId),
        })
        if (project?.title) {
          projectTitle = typeof project.title === 'string'
            ? project.title
            : getLocalizedValue(project.title as LocalizedString, 'en')
        }
      }

      // Create admin notification
      try {
        await notifyDonationReceived({
          donationId: donation.id,
          donorName: donation.isAnonymous ? undefined : donation.donorName || undefined,
          amount: donation.amount / 100,
          currency: donation.currency || 'MYR',
          projectTitle,
          paymentReference,
        })
        console.log(`Notification created for donation ${paymentReference}`)
      } catch (notifyError) {
        console.error('Failed to create notification:', notifyError)
      }

      // Send receipt email with PDF attachment
      try {
        // Get the updated donation data
        const updatedDonation = await db.query.donations.findFirst({
          where: eq(donations.id, donation.id),
        })

        if (updatedDonation && updatedDonation.donorEmail) {
          // Get receipt data
          const receiptData = await getReceiptData(paymentReference)

          if (receiptData) {
            // Generate PDF
            let pdfBuffer: Buffer | undefined
            try {
              pdfBuffer = await renderToBuffer(
                <ReceiptPDF data={receiptData} />
              )
            } catch (pdfError) {
              console.error('Failed to generate PDF:', pdfError)
            }

            // Send email (receiptData.amount is already in currency units, not cents)
            const emailResult = await sendDonationReceiptEmail({
              receiptNumber: receiptData.receiptNumber,
              donorName: receiptData.donorName,
              donorEmail: receiptData.donorEmail,
              amount: receiptData.amount,
              currency: receiptData.currency,
              projectTitle: receiptData.projectTitle,
              paymentReference: receiptData.paymentReference,
              completedAt: receiptData.completedAt,
              pdfBuffer,
              organization: receiptData.organization, // Pass organization config for email
            })

            if (emailResult.success) {
              // Update receipt sent timestamp
              await db
                .update(donations)
                .set({ receiptSentAt: new Date() })
                .where(eq(donations.id, donation.id))

              // Log email sent
              await logWebhookEvent(donation.id, 'receipt_email_sent', {
                messageId: emailResult.messageId,
                email: receiptData.donorEmail,
              }, request)

              console.log(`Receipt email sent for ${paymentReference}`)
            } else {
              console.error(`Failed to send receipt email: ${emailResult.error || emailResult.reason}`)
              await logWebhookEvent(donation.id, 'receipt_email_failed', {
                error: emailResult.error || emailResult.reason,
              }, request)
            }
          }
        }
      } catch (emailError) {
        console.error('Receipt email error:', emailError)
        await logWebhookEvent(donation.id, 'receipt_email_error', {
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        }, request)
      }
    }

    // ===== RETURN SUCCESS =====

    const processingTime = Date.now() - startTime
    console.log(`[Webhook ${requestId}] Processing completed in ${processingTime}ms`)
    console.log(`[Webhook ${requestId}] Final status: ${newStatus}`)
    console.log(`${'='.repeat(60)}\n`)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      status: newStatus,
      processingTime: `${processingTime}ms`,
    })

  } catch (error) {
    console.error(`[Webhook] Processing error:`, error)
    console.error(`[Webhook] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET - Webhook verification endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Handle ToyyibPay verification challenge
  const challenge = searchParams.get('challenge') || searchParams.get('hub.challenge')
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  // Return status for health checks
  return NextResponse.json({
    status: 'ok',
    message: 'Donation webhook endpoint is active',
    timestamp: new Date().toISOString(),
    endpoints: {
      callback: 'POST /api/donations/webhook',
      verify: 'GET /api/donations/webhook',
    },
  })
}
