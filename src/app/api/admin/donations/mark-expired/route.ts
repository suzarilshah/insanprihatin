import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { adminLogger as logger } from '@/lib/logger'

/**
 * Admin API: Mark Donation as Expired
 *
 * Allows admins to mark stale pending donations as expired.
 * This is useful for donations where the user abandoned the payment process.
 *
 * SECURITY: Requires admin authentication
 */

export async function POST(request: NextRequest) {
  const requestId = `expire_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const operation = logger.startOperation('markDonationExpired', { requestId })

  try {
    // Require admin authentication
    await requireAuth()

    const body = await request.json()
    const { reference, reason } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    logger.info('Marking donation as expired', { requestId, reference, reason })

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

    // Only allow marking pending donations as expired
    if (donation.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Cannot mark completed donations as expired' },
        { status: 400 }
      )
    }

    if (donation.paymentStatus === 'expired') {
      return NextResponse.json({
        success: true,
        message: 'Donation is already marked as expired',
        noChange: true,
      })
    }

    // Update to expired
    await db
      .update(donations)
      .set({
        paymentStatus: 'expired',
        failureReason: reason || 'Marked as expired by admin - payment not received',
      })
      .where(eq(donations.id, donation.id))

    // Log the action
    await db.insert(donationLogs).values({
      donationId: donation.id,
      eventType: 'admin_marked_expired',
      eventData: {
        previousStatus: donation.paymentStatus,
        reason: reason || 'Payment not received',
        markedBy: 'admin',
      },
    })

    operation.success('Donation marked as expired', { reference })

    return NextResponse.json({
      success: true,
      message: 'Donation marked as expired',
      previousStatus: donation.paymentStatus,
    })

  } catch (error) {
    operation.failure(error instanceof Error ? error : new Error('Unknown error'))
    logger.error('Failed to mark donation as expired', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to mark donation as expired' },
      { status: 500 }
    )
  }
}
