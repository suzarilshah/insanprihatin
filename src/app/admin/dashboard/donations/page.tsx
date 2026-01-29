import Link from 'next/link'
import { db, donations } from '@/db'
import { desc, sql, eq } from 'drizzle-orm'

async function getDonationStats() {
  const stats = await db.select({
    total: sql<number>`COALESCE(SUM(amount), 0)`,
    count: sql<number>`COUNT(*)`,
    completed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
    pending: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'pending')`,
  }).from(donations)

  return {
    total: Number(stats[0].total) / 100,
    count: Number(stats[0].count),
    completed: Number(stats[0].completed),
    pending: Number(stats[0].pending),
  }
}

async function getDonations() {
  const donationsList = await db.query.donations.findMany({
    orderBy: [desc(donations.createdAt)],
  })
  return donationsList
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
}

export default async function DonationsManagement() {
  const stats = await getDonationStats()
  const donationsList = await getDonations()

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Donations</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Donation Records
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all donation transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
          <p className="text-teal-100 text-sm">Total Raised</p>
          <p className="font-display text-3xl font-bold">RM {stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Total Donations</p>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">{stats.count}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="font-display text-3xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="font-display text-3xl font-bold text-amber-600">{stats.pending}</p>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 font-medium">Donor</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Reference</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {donationsList.map((donation) => (
                <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foundation-charcoal">
                        {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Unknown'}
                      </p>
                      {donation.donorEmail && !donation.isAnonymous && (
                        <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foundation-charcoal">
                      {donation.currency} {(donation.amount / 100).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="font-mono text-sm text-gray-500">
                      {donation.paymentReference || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[donation.paymentStatus || 'pending']
                    }`}>
                      {donation.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell">
                    {formatDate(donation.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {donationsList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No donations yet</p>
          </div>
        )}
      </div>

      {/* Message Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Completed - Payment received</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Pending - Awaiting payment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>Failed - Payment unsuccessful</span>
        </div>
      </div>
    </div>
  )
}
