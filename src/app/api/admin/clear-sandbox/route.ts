import { NextRequest, NextResponse } from 'next/server'
import { db, donations, donationLogs } from '@/db'
import { eq } from 'drizzle-orm'

/**
 * Admin API to clear sandbox/test donations
 *
 * This endpoint removes all donations marked as 'sandbox' environment
 * to keep production data clean.
 *
 * SECURITY: Should only be accessible to authenticated admins
 */

export async function DELETE(request: NextRequest) {
  try {
    // Get count of sandbox donations before deletion
    const sandboxDonations = await db.query.donations.findMany({
      where: eq(donations.environment, 'sandbox'),
      columns: { id: true },
    })

    const count = sandboxDonations.length

    if (count === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sandbox donations to delete',
        deleted: 0,
      })
    }

    // Delete donation logs first (foreign key constraint)
    for (const donation of sandboxDonations) {
      await db.delete(donationLogs).where(eq(donationLogs.donationId, donation.id))
    }

    // Delete sandbox donations
    await db.delete(donations).where(eq(donations.environment, 'sandbox'))

    console.log(`[Admin] Cleared ${count} sandbox donations`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${count} sandbox donation(s)`,
      deleted: count,
    })

  } catch (error) {
    console.error('[Admin] Error clearing sandbox donations:', error)
    return NextResponse.json(
      { error: 'Failed to clear sandbox donations' },
      { status: 500 }
    )
  }
}

// GET endpoint to check sandbox donation count
export async function GET() {
  try {
    const sandboxDonations = await db.query.donations.findMany({
      where: eq(donations.environment, 'sandbox'),
      columns: { id: true, amount: true, createdAt: true },
    })

    const totalAmount = sandboxDonations.reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json({
      count: sandboxDonations.length,
      totalAmount: totalAmount / 100,
      message: sandboxDonations.length > 0
        ? `Found ${sandboxDonations.length} sandbox donations totaling RM ${(totalAmount / 100).toLocaleString()}`
        : 'No sandbox donations found',
    })

  } catch (error) {
    console.error('[Admin] Error checking sandbox donations:', error)
    return NextResponse.json(
      { error: 'Failed to check sandbox donations' },
      { status: 500 }
    )
  }
}
