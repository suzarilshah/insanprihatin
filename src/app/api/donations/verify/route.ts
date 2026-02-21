import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs, projects } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { ToyyibPayService } from '@/lib/toyyibpay'
import { generateReceiptNumber, getReceiptData } from '@/lib/receipt'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'
import { sendDonationReceiptEmail } from '@/lib/email'
import { webhookLogger as logger } from '@/lib/logger'

/**
 * Payment Verification API
 *
 * Verifies payment status by checking both our database and ToyyibPay API.
 * Used by the success page to confirm payment status.
 *
 * IMPORTANT: This endpoint also handles auto-recovery for cases where
 * the webhook callback fails (e.g., when testing on localhost).
 * If ToyyibPay shows completed but our DB shows pending, we auto-update.
 */

// Helper to get project title
async function getProjectTitle(projectId: string | null): Promise<string | null> {
  if (!projectId) return null
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { title: true },
  })
  if (!project?.title) return null
  if (typeof project.title === 'string') return project.title
  return getLocalizedValue(project.title as LocalizedString, 'en')
}

// Helper to build full donation response
async function buildDonationResponse(donation: typeof donations.$inferSelect, overrides?: Partial<{
  paymentStatus: string
  receiptNumber: string
  completedAt: Date | string
}>) {
  const projectTitle = await getProjectTitle(donation.projectId)

  return {
    id: donation.id,
    donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
    donorEmail: donation.isAnonymous ? null : donation.donorEmail,
    amount: donation.amount / 100,
    currency: donation.currency || 'MYR',
    paymentStatus: overrides?.paymentStatus || donation.paymentStatus,
    paymentReference: donation.paymentReference,
    receiptNumber: overrides?.receiptNumber || donation.receiptNumber,
    projectTitle,
    message: donation.message,
    createdAt: donation.createdAt?.toISOString(),
    completedAt: overrides?.completedAt
      ? (typeof overrides.completedAt === 'string' ? overrides.completedAt : overrides.completedAt.toISOString())
      : donation.completedAt?.toISOString() || null,
    failureReason: donation.failureReason,
  }
}

export async function GET(request: NextRequest) {
  const requestId = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const operation = logger.startOperation('verifyPayment', { requestId })

  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      logger.warn('Missing payment reference', { requestId })
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    logger.info('Looking up donation', { requestId, reference })

    // Find donation in database
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (!donation) {
      logger.warn('Donation not found', { requestId, reference })
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    logger.info('Found donation', { requestId, donationId: donation.id, status: donation.paymentStatus })

    // If already completed, return immediately
    if (donation.paymentStatus === 'completed') {
      logger.debug('Donation already completed', { requestId, reference })
      const donationData = await buildDonationResponse(donation)
      return NextResponse.json({
        success: true,
        status: 'completed',
        verified: true,
        donation: donationData,
      })
    }

    // If we have a ToyyibPay bill code, verify with ToyyibPay API
    if (donation.toyyibpayBillCode && ToyyibPayService.isConfigured()) {
      try {
        const transactions = await ToyyibPayService.getBillTransactions(donation.toyyibpayBillCode)

        if (transactions && transactions.length > 0) {
          const latestTransaction = transactions[0]
          const toyyibpayStatus = latestTransaction.billpaymentStatus

          // Map ToyyibPay status
          const mappedStatus = ToyyibPayService.mapPaymentStatus(toyyibpayStatus)

          // If ToyyibPay shows completed but our DB doesn't, the webhook might have failed
          // AUTO-RECOVERY: Update the payment status to completed
          if (mappedStatus === 'completed' && donation.paymentStatus !== 'completed') {
            logger.info('Auto-recovery triggered', {
              requestId,
              reference,
              toyyibpayStatus: 'completed',
              dbStatus: donation.paymentStatus,
            })

            // Generate receipt number
            const receiptNumber = await generateReceiptNumber()

            // Update donation to completed
            await db
              .update(donations)
              .set({
                paymentStatus: 'completed',
                completedAt: new Date(),
                receiptNumber,
                toyyibpayTransactionId: latestTransaction.transactionId,
              })
              .where(eq(donations.id, donation.id))

            // Update project raised amount if applicable
            if (donation.projectId) {
              await db
                .update(projects)
                .set({
                  donationRaised: sql`COALESCE(donation_raised, 0) + ${donation.amount}`,
                })
                .where(eq(projects.id, donation.projectId))
              logger.info('Updated project raised amount', {
                requestId,
                projectId: donation.projectId,
                amountAdded: donation.amount / 100,
              })
            }

            // Log the auto-recovery
            await db.insert(donationLogs).values({
              donationId: donation.id,
              eventType: 'auto_recovery_completed',
              eventData: {
                previousStatus: donation.paymentStatus,
                newStatus: 'completed',
                toyyibpayStatus: mappedStatus,
                transactionId: latestTransaction.transactionId,
                receiptNumber,
                reason: 'Webhook callback likely failed (localhost testing or network issue)',
              },
            })

            logger.info('Auto-recovery successful', { requestId, reference, receiptNumber })

            // Send receipt email (same logic as webhook handler)
            if (donation.donorEmail) {
              try {
                logger.info('Sending receipt email', { requestId, email: donation.donorEmail })
                const receiptData = await getReceiptData(reference)

                if (receiptData) {
                  // Generate PDF
                  let pdfBuffer: Buffer | undefined
                  try {
                    const { renderToBuffer } = await import('@react-pdf/renderer')
                    const { ReceiptPDF } = await import('@/lib/receipt-pdf')
                    const React = await import('react')
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const element = React.createElement(ReceiptPDF as any, { data: receiptData })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pdfBuffer = await renderToBuffer(element as any)
                    logger.debug('PDF generated', { requestId, sizeKB: Math.round(pdfBuffer.length / 1024) })
                  } catch (pdfError) {
                    logger.error('Failed to generate PDF', {
                      requestId,
                      error: pdfError instanceof Error ? pdfError.message : 'Unknown error',
                    })
                  }

                  // Send email
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
                    organization: receiptData.organization,
                  })

                  if (emailResult.success) {
                    // Update receipt sent timestamp
                    await db
                      .update(donations)
                      .set({ receiptSentAt: new Date() })
                      .where(eq(donations.id, donation.id))

                    // Log email sent
                    await db.insert(donationLogs).values({
                      donationId: donation.id,
                      eventType: 'receipt_email_sent',
                      eventData: {
                        messageId: emailResult.messageId,
                        email: receiptData.donorEmail,
                        source: 'auto_recovery',
                      },
                    })

                    logger.info('Receipt email sent successfully', { requestId, reference })
                  } else {
                    logger.error('Failed to send receipt email', {
                      requestId,
                      error: emailResult.error || emailResult.reason,
                    })
                    await db.insert(donationLogs).values({
                      donationId: donation.id,
                      eventType: 'receipt_email_failed',
                      eventData: {
                        error: emailResult.error || emailResult.reason,
                        source: 'auto_recovery',
                      },
                    })
                  }
                }
              } catch (emailError) {
                logger.error('Receipt email error', {
                  requestId,
                  error: emailError instanceof Error ? emailError.message : 'Unknown error',
                })
                await db.insert(donationLogs).values({
                  donationId: donation.id,
                  eventType: 'receipt_email_error',
                  eventData: {
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                    source: 'auto_recovery',
                  },
                })
              }
            }

            // Return the updated status with full donation data
            const donationData = await buildDonationResponse(donation, {
              paymentStatus: 'completed',
              receiptNumber,
              completedAt: new Date(),
            })

            return NextResponse.json({
              success: true,
              status: 'completed',
              toyyibpayStatus: mappedStatus,
              verified: true,
              autoRecovered: true,
              donation: donationData,
              transaction: {
                id: latestTransaction.transactionId,
                status: toyyibpayStatus,
                channel: latestTransaction.billpaymentChannel,
              },
            })
          }

          operation.success('Auto-recovery completed', { status: mappedStatus, autoRecovered: true })
          logger.info('ToyyibPay verification complete', { requestId, reference, status: mappedStatus })

          const donationData = await buildDonationResponse(donation)
          return NextResponse.json({
            success: true,
            status: donation.paymentStatus,
            toyyibpayStatus: mappedStatus,
            verified: true,
            donation: donationData,
            transaction: {
              id: latestTransaction.transactionId,
              status: toyyibpayStatus,
              channel: latestTransaction.billpaymentChannel,
            },
          })
        }
      } catch (error) {
        logger.error('Failed to verify with ToyyibPay', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        // Continue with database status only
      }
    }

    // Return database status (not verified with ToyyibPay)
    operation.success('DB status returned', { status: donation.paymentStatus, verified: false })
    logger.info('Returning DB status only', { requestId, reference, status: donation.paymentStatus })
    const donationData = await buildDonationResponse(donation)
    return NextResponse.json({
      success: true,
      status: donation.paymentStatus,
      verified: false, // Not verified with ToyyibPay
      donation: donationData,
    })

  } catch (error) {
    operation.failure(error instanceof Error ? error : new Error('Payment verification failed'))
    logger.error('Payment verification error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
