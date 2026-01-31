import Link from 'next/link'
import { db, donations, projects } from '@/db'
import { desc, sql, eq, and, gte, lte } from 'drizzle-orm'
import DonationsTable from './DonationsTable'
import DonationFilters from './DonationFilters'

interface SearchParams {
  status?: string
  project?: string
  search?: string
  from?: string
  to?: string
  page?: string
}

async function getDonationStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Overall stats
  const overallStats = await db.select({
    total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
    count: sql<number>`COUNT(*)`,
    completed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
    pending: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'pending')`,
    failed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'failed')`,
    avgDonation: sql<number>`COALESCE(AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END), 0)`,
  }).from(donations)

  // This month's stats
  const thisMonthStats = await db.select({
    total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
    count: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
  }).from(donations).where(gte(donations.createdAt, startOfMonth))

  // Last month's stats (for comparison)
  const lastMonthStats = await db.select({
    total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
  }).from(donations).where(
    and(
      gte(donations.createdAt, startOfLastMonth),
      lte(donations.createdAt, endOfLastMonth)
    )
  )

  const completedCount = Number(overallStats[0].completed) || 0
  const totalCount = Number(overallStats[0].count) || 0
  const successRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const thisMonthTotal = Number(thisMonthStats[0].total) / 100
  const lastMonthTotal = Number(lastMonthStats[0].total) / 100
  const monthlyGrowth = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    : thisMonthTotal > 0 ? 100 : 0

  return {
    totalRaised: Number(overallStats[0].total) / 100,
    totalCount,
    completed: completedCount,
    pending: Number(overallStats[0].pending) || 0,
    failed: Number(overallStats[0].failed) || 0,
    avgDonation: Number(overallStats[0].avgDonation) / 100,
    successRate: Math.round(successRate),
    thisMonthTotal,
    thisMonthCount: Number(thisMonthStats[0].count) || 0,
    monthlyGrowth: Math.round(monthlyGrowth),
  }
}

async function getDonations(params: SearchParams) {
  const conditions = []

  // Status filter
  if (params.status && params.status !== 'all') {
    conditions.push(eq(donations.paymentStatus, params.status))
  }

  // Project filter
  if (params.project && params.project !== 'all') {
    conditions.push(eq(donations.projectId, params.project))
  }

  // Date range filter
  if (params.from) {
    conditions.push(gte(donations.createdAt, new Date(params.from)))
  }
  if (params.to) {
    const toDate = new Date(params.to)
    toDate.setHours(23, 59, 59, 999)
    conditions.push(lte(donations.createdAt, toDate))
  }

  const donationsList = await db.query.donations.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(donations.createdAt)],
    limit: 100,
  })

  // Filter by search term if provided
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    return donationsList.filter(d =>
      (d.donorName?.toLowerCase().includes(searchLower)) ||
      (d.donorEmail?.toLowerCase().includes(searchLower)) ||
      (d.paymentReference?.toLowerCase().includes(searchLower)) ||
      (d.receiptNumber?.toLowerCase().includes(searchLower))
    )
  }

  return donationsList
}

async function getProjectsForFilter() {
  const projectsList = await db.query.projects.findMany({
    where: eq(projects.donationEnabled, true),
    columns: {
      id: true,
      title: true,
    },
    orderBy: [desc(projects.createdAt)],
  })
  return projectsList
}

export default async function DonationsManagement({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const stats = await getDonationStats()
  const donationsList = await getDonations(params)
  const projectsForFilter = await getProjectsForFilter()

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
            Donation Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage all donation transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <svg className="w-24 h-24 -mr-4 -mt-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <p className="text-teal-100 text-sm mb-1">Total Raised</p>
          <p className="font-display text-3xl font-bold">RM {stats.totalRaised.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {stats.monthlyGrowth >= 0 ? (
              <span className="text-teal-200">+{stats.monthlyGrowth}% vs last month</span>
            ) : (
              <span className="text-red-200">{stats.monthlyGrowth}% vs last month</span>
            )}
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-sm">This Month</p>
            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-foundation-charcoal">
            RM {stats.thisMonthTotal.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-1">{stats.thisMonthCount} donations</p>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-sm">Success Rate</p>
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-foundation-charcoal">
            {stats.successRate}%
          </p>
          <p className="text-gray-500 text-sm mt-1">{stats.completed} of {stats.totalCount} completed</p>
        </div>

        {/* Average Donation */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-sm">Avg. Donation</p>
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-foundation-charcoal">
            RM {stats.avgDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-500 text-sm mt-1">per transaction</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-900 font-semibold text-xl">{stats.completed}</p>
              <p className="text-emerald-600 text-sm">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-900 font-semibold text-xl">{stats.pending}</p>
              <p className="text-amber-600 text-sm">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-red-900 font-semibold text-xl">{stats.failed}</p>
              <p className="text-red-600 text-sm">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DonationFilters projects={projectsForFilter} currentParams={params} />

      {/* Donations Table */}
      <DonationsTable donations={donationsList} />

      {/* Results Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <p>
          Showing {donationsList.length} donation{donationsList.length !== 1 ? 's' : ''}
          {params.status && params.status !== 'all' && ` (${params.status})`}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Failed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
