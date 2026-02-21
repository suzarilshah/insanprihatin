import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs, projects } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { ToyyibPayService } from '@/lib/toyyibpay'
import { generateReceiptNumber } from '@/lib/receipt'
import { adminLogger as logger } from '@/lib/logger'

/**
 * Admin API: Refresh Payment Status
 *
 * Checks ToyyibPay API for the latest payment status and updates our database.
 * This is useful when webhooks fail or for verifying pending payments.
 *
 * SECURITY: Requires admin authentication
 */

export async function POST(request: NextRequest) {
  const requestId = `refresh_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const operation = logger.startOperation('refreshPaymentStatus', { requestId })

  try {
    // Require admin authentication
    await requireAuth()

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    logger.info('Refreshing payment status', { requestId, reference })

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

    // If already completed, no need to refresh
    if (donation.paymentStatus === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already completed',
        status: 'completed',
        noChange: true,
      })
    }

    // Check if ToyyibPay is configured
    if (!ToyyibPayService.isConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Check if we have a bill code
    if (!donation.toyyibpayBillCode) {
      return NextResponse.json(
        { error: 'No ToyyibPay bill code found for this donation' },
        { status: 400 }
      )
    }

    // Query ToyyibPay for transactions
    const transactions = await ToyyibPayService.getBillTransactions(donation.toyyibpayBillCode)

    if (!transactions || transactions.length === 0) {
      logger.info('No transactions found in ToyyibPay', { requestId, reference })

      // Log the check
      await db.insert(donationLogs).values({
        donationId: donation.id,
        eventType: 'admin_status_check',
        eventData: {
          result: 'no_transactions',
          checkedBy: 'admin',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'No payment transactions found in ToyyibPay',
        status: donation.paymentStatus,
        noChange: true,
        details: 'The user may not have completed the payment process',
      })
    }

    // Get the latest transaction
    const latestTransaction = transactions[0]
    const toyyibpayStatus = latestTransaction.billpaymentStatus
    const mappedStatus = ToyyibPayService.mapPaymentStatus(toyyibpayStatus)

    logger.info('ToyyibPay status retrieved', {
      requestId,
      reference,
      toyyibpayStatus,
      mappedStatus,
      currentDbStatus: donation.paymentStatus,
    })

    // If status changed, update
    if (mappedStatus !== donation.paymentStatus) {
      const updateData: Record<string, unknown> = {
        paymentStatus: mappedStatus,
        toyyibpayTransactionId: latestTransaction.transactionId,
      }

      // If now completed, set completed date and generate receipt
      if (mappedStatus === 'completed') {
        const receiptNumber = await generateReceiptNumber()
        updateData.completedAt = new Date()
        updateData.receiptNumber = receiptNumber

        // Update donation
        await db
          .update(donations)
          .set(updateData)
          .where(eq(donations.id, donation.id))

        // Update project raised amount if applicable
        if (donation.projectId) {
          await db
            .update(projects)
            .set({
              donationRaised: sql`COALESCE(donation_raised, 0) + ${donation.amount}`,
            })
            .where(eq(projects.id, donation.projectId))
        }

        // Log the update
        await db.insert(donationLogs).values({
          donationId: donation.id,
          eventType: 'admin_status_refresh',
          eventData: {
            previousStatus: donation.paymentStatus,
            newStatus: mappedStatus,
            toyyibpayStatus,
            transactionId: latestTransaction.transactionId,
            receiptNumber,
            refreshedBy: 'admin',
          },
        })

        operation.success('Status updated to completed', { reference, receiptNumber })

        return NextResponse.json({
          success: true,
          message: 'Payment status updated to completed',
          status: 'completed',
          receiptNumber,
          previousStatus: donation.paymentStatus,
          transactionId: latestTransaction.transactionId,
        })
      }

      // For other status changes (e.g., pending -> failed)
      if (mappedStatus === 'failed') {
        updateData.failureReason = `ToyyibPay status: ${toyyibpayStatus}`
      }

      await db
        .update(donations)
        .set(updateData)
        .where(eq(donations.id, donation.id))

      // Log the update
      await db.insert(donationLogs).values({
        donationId: donation.id,
        eventType: 'admin_status_refresh',
        eventData: {
          previousStatus: donation.paymentStatus,
          newStatus: mappedStatus,
          toyyibpayStatus,
          transactionId: latestTransaction.transactionId,
          refreshedBy: 'admin',
        },
      })

      operation.success('Status updated', { reference, newStatus: mappedStatus })

      return NextResponse.json({
        success: true,
        message: `Payment status updated to ${mappedStatus}`,
        status: mappedStatus,
        previousStatus: donation.paymentStatus,
        transactionId: latestTransaction.transactionId,
      })
    }

    // No change
    operation.success('No status change', { reference })

    return NextResponse.json({
      success: true,
      message: 'Payment status unchanged',
      status: donation.paymentStatus,
      noChange: true,
      toyyibpayStatus,
    })

  } catch (error) {
    operation.failure(error instanceof Error ? error : new Error('Unknown error'))
    logger.error('Failed to refresh payment status', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to refresh payment status' },
      { status: 500 }
    )
  }
}
