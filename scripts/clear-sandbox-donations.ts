/**
 * Script to clear sandbox donations from the database
 *
 * Run with: npx tsx scripts/clear-sandbox-donations.ts
 */

import 'dotenv/config'
import { db, donations, donationLogs } from '../src/db'
import { eq } from 'drizzle-orm'

async function clearSandboxDonations() {
  console.log('🔍 Looking for sandbox donations...\n')

  try {
    // Get sandbox donations
    const sandboxDonations = await db.query.donations.findMany({
      where: eq(donations.environment, 'sandbox'),
      columns: {
        id: true,
        amount: true,
        donorName: true,
        createdAt: true,
        paymentStatus: true,
      },
    })

    if (sandboxDonations.length === 0) {
      console.log('✅ No sandbox donations found. Database is clean!\n')
      process.exit(0)
    }

    console.log(`Found ${sandboxDonations.length} sandbox donation(s):\n`)

    // Show what will be deleted
    let totalAmount = 0
    for (const donation of sandboxDonations) {
      const amount = donation.amount / 100
      totalAmount += amount
      console.log(`  - ${donation.id.substring(0, 8)}... | RM ${amount.toFixed(2)} | ${donation.donorName || 'Anonymous'} | ${donation.paymentStatus}`)
    }

    console.log(`\n  Total: RM ${totalAmount.toFixed(2)}\n`)
    console.log('🗑️  Deleting sandbox donations...\n')

    // Delete donation logs first (foreign key constraint)
    let logsDeleted = 0
    for (const donation of sandboxDonations) {
      const result = await db.delete(donationLogs).where(eq(donationLogs.donationId, donation.id))
      logsDeleted += 1
    }
    console.log(`  Deleted logs for ${logsDeleted} donations`)

    // Delete the donations
    await db.delete(donations).where(eq(donations.environment, 'sandbox'))
    console.log(`  Deleted ${sandboxDonations.length} sandbox donations`)

    console.log('\n✅ Sandbox cleanup complete!\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

clearSandboxDonations()
