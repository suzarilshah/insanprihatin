import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs, projects } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { ToyyibPayService } from '@/lib/toyyibpay'
import { generateReceiptNumber } from '@/lib/receipt'

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
  return project?.title || null
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
  console.log('[Verify] Payment verification request received')

  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      console.log('[Verify] Missing payment reference')
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    console.log(`[Verify] Looking up donation: ${reference}`)

    // Find donation in database
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (!donation) {
      console.log(`[Verify] Donation not found: ${reference}`)
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    console.log(`[Verify] Found donation: ${donation.id}, status: ${donation.paymentStatus}`)

    // If already completed, return immediately
    if (donation.paymentStatus === 'completed') {
      console.log(`[Verify] Donation already completed: ${reference}`)
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
            console.log(`[Verify] Auto-recovery triggered for ${reference}`)
            console.log(`[Verify] ToyyibPay status: completed, DB status: ${donation.paymentStatus}`)

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
              console.log(`[Verify] Updated project ${donation.projectId} raised amount: +${donation.amount / 100}`)
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

            console.log(`[Verify] Auto-recovery successful for ${reference}, receipt: ${receiptNumber}`)

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

          console.log(`[Verify] ToyyibPay verification complete for ${reference}, status: ${mappedStatus}`)

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
        console.error('[Verify] Failed to verify with ToyyibPay:', error)
        // Continue with database status only
      }
    }

    // Return database status (not verified with ToyyibPay)
    console.log(`[Verify] Returning DB status only for ${reference}: ${donation.paymentStatus}`)
    const donationData = await buildDonationResponse(donation)
    return NextResponse.json({
      success: true,
      status: donation.paymentStatus,
      verified: false, // Not verified with ToyyibPay
      donation: donationData,
    })

  } catch (error) {
    console.error('[Verify] Payment verification error:', error)
    console.error('[Verify] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
