import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs } from '@/db'
import { eq } from 'drizzle-orm'
import { ToyyibPayService } from '@/lib/toyyibpay'

/**
 * Payment Verification API
 *
 * Verifies payment status by checking both our database and ToyyibPay API.
 * Used by the success page to confirm payment status.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Find donation in database
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // If already completed, return immediately
    if (donation.paymentStatus === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        verified: true,
        donation: {
          reference: donation.paymentReference,
          amount: donation.amount / 100,
          currency: donation.currency,
          receiptNumber: donation.receiptNumber,
          completedAt: donation.completedAt,
        },
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
          // Log this for investigation
          if (mappedStatus === 'completed' && donation.paymentStatus !== 'completed') {
            console.warn(`Payment ${reference} completed in ToyyibPay but pending in DB`)

            // Log the discrepancy
            await db.insert(donationLogs).values({
              donationId: donation.id,
              eventType: 'verification_discrepancy',
              eventData: {
                dbStatus: donation.paymentStatus,
                toyyibpayStatus: mappedStatus,
                transactionId: latestTransaction.transactionId,
              },
            })
          }

          return NextResponse.json({
            success: true,
            status: donation.paymentStatus,
            toyyibpayStatus: mappedStatus,
            verified: true,
            donation: {
              reference: donation.paymentReference,
              amount: donation.amount / 100,
              currency: donation.currency,
              receiptNumber: donation.receiptNumber,
              billCode: donation.toyyibpayBillCode,
            },
            transaction: {
              id: latestTransaction.transactionId,
              status: toyyibpayStatus,
              channel: latestTransaction.billpaymentChannel,
            },
          })
        }
      } catch (error) {
        console.error('Failed to verify with ToyyibPay:', error)
        // Continue with database status only
      }
    }

    // Return database status
    return NextResponse.json({
      success: true,
      status: donation.paymentStatus,
      verified: false, // Not verified with ToyyibPay
      donation: {
        reference: donation.paymentReference,
        amount: donation.amount / 100,
        currency: donation.currency,
        failureReason: donation.failureReason,
      },
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
