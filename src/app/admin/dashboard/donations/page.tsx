import Link from 'next/link'
import { db, donations, projects } from '@/db'
import { desc, sql, eq, and, gte, lte } from 'drizzle-orm'
import DonationsTable from './DonationsTable'
import DonationFilters from './DonationFilters'
import EnvironmentBanner from './EnvironmentBanner'

interface SearchParams {
  status?: string
  project?: string
  search?: string
  from?: string
  to?: string
  environment?: string // 'sandbox' | 'production' | 'all'
  page?: string
}

interface DonationStats {
  totalRaised: number
  totalCount: number
  completed: number
  pending: number
  failed: number
  avgDonation: number
  successRate: number
  thisMonthTotal: number
  thisMonthCount: number
  monthlyGrowth: number
}

interface EnvironmentStats {
  production: DonationStats
  sandbox: DonationStats
  combined: DonationStats
}

async function getDonationStats(): Promise<EnvironmentStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Helper to calculate stats for a specific environment filter
  const calculateStats = async (envFilter?: 'production' | 'sandbox'): Promise<DonationStats> => {
    const whereClause = envFilter ? eq(donations.environment, envFilter) : undefined

    // Overall stats
    const overallStats = await db.select({
      total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
      count: sql<number>`COUNT(*)`,
      completed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
      pending: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'pending')`,
      failed: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'failed')`,
      avgDonation: sql<number>`COALESCE(AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END), 0)`,
    }).from(donations).where(whereClause)

    // This month's stats
    const thisMonthWhere = whereClause
      ? and(whereClause, gte(donations.createdAt, startOfMonth))
      : gte(donations.createdAt, startOfMonth)

    const thisMonthStats = await db.select({
      total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
      count: sql<number>`COUNT(*) FILTER (WHERE payment_status = 'completed')`,
    }).from(donations).where(thisMonthWhere)

    // Last month's stats (for comparison)
    const lastMonthWhere = whereClause
      ? and(
          whereClause,
          gte(donations.createdAt, startOfLastMonth),
          lte(donations.createdAt, endOfLastMonth)
        )
      : and(
          gte(donations.createdAt, startOfLastMonth),
          lte(donations.createdAt, endOfLastMonth)
        )

    const lastMonthStats = await db.select({
      total: sql<number>`COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0)`,
    }).from(donations).where(lastMonthWhere)

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

  // Calculate stats for both environments and combined
  const [production, sandbox, combined] = await Promise.all([
    calculateStats('production'),
    calculateStats('sandbox'),
    calculateStats(),
  ])

  return { production, sandbox, combined }
}

async function getDonations(params: SearchParams) {
  const conditions = []

  // Environment filter
  if (params.environment && params.environment !== 'all') {
    conditions.push(eq(donations.environment, params.environment))
  }

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
  const envStats = await getDonationStats()
  const donationsList = await getDonations(params)
  const projectsForFilter = await getProjectsForFilter()

  // Determine which stats to show based on environment filter
  const currentEnv = params.environment || 'all'
  const stats = currentEnv === 'production'
    ? envStats.production
    : currentEnv === 'sandbox'
      ? envStats.sandbox
      : envStats.combined

  // Check if there are any sandbox donations
  const hasSandboxDonations = envStats.sandbox.totalCount > 0

  return (
    <div className="min-h-screen">
      {/* Environment Warning Banner - Only show if viewing sandbox or if sandbox donations exist */}
      {(currentEnv === 'sandbox' || (currentEnv === 'all' && hasSandboxDonations)) && (
        <EnvironmentBanner
          environment={currentEnv}
          sandboxCount={envStats.sandbox.totalCount}
          productionCount={envStats.production.totalCount}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600 transition-colors">Dashboard</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-foundation-charcoal font-medium">Donations</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foundation-charcoal">
              Donation Management
            </h1>
            {currentEnv !== 'all' && (
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                currentEnv === 'sandbox'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {currentEnv === 'sandbox' ? 'Sandbox Mode' : 'Production'}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Track, analyze, and manage all donation transactions in real-time
          </p>
        </div>

        {/* Quick Export Button */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Environment Comparison Cards - Only show when viewing all */}
      {currentEnv === 'all' && hasSandboxDonations && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Production Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">Production Donations</h3>
                  <p className="text-sm text-emerald-600">Real transactions</p>
                </div>
              </div>
              <Link
                href="/admin/dashboard/donations?environment=production"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Only &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-emerald-900">RM {envStats.production.totalRaised.toLocaleString()}</p>
                <p className="text-xs text-emerald-600">Total Raised</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{envStats.production.completed}</p>
                <p className="text-xs text-emerald-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{envStats.production.successRate}%</p>
                <p className="text-xs text-emerald-600">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Sandbox Summary */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Sandbox Donations</h3>
                  <p className="text-sm text-amber-600">Test transactions</p>
                </div>
              </div>
              <Link
                href="/admin/dashboard/donations?environment=sandbox"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View Only &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-amber-900">RM {envStats.sandbox.totalRaised.toLocaleString()}</p>
                <p className="text-xs text-amber-600">Test Amount</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">{envStats.sandbox.totalCount}</p>
                <p className="text-xs text-amber-600">Total Tests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">{envStats.sandbox.successRate}%</p>
                <p className="text-xs text-amber-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute right-0 top-0 opacity-10">
            <svg className="w-32 h-32 -mr-8 -mt-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-teal-100 text-sm font-medium">Total Raised</p>
              {currentEnv === 'sandbox' && (
                <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded text-white font-medium">TEST</span>
              )}
            </div>
            <p className="font-display text-4xl font-bold tracking-tight">
              RM {stats.totalRaised.toLocaleString()}
            </p>
            <div className="mt-3 flex items-center gap-2">
              {stats.monthlyGrowth >= 0 ? (
                <>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {stats.monthlyGrowth}%
                  </span>
                  <span className="text-teal-200 text-xs">vs last month</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/30 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {Math.abs(stats.monthlyGrowth)}%
                  </span>
                  <span className="text-red-200 text-xs">vs last month</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm font-medium">This Month</p>
            <span className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">
            RM {stats.thisMonthTotal.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-emerald-600 font-medium text-sm">{stats.thisMonthCount}</span>
            <span className="text-gray-400 text-sm">donations</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm font-medium">Success Rate</p>
            <span className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">
            {stats.successRate}%
          </p>
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-1.5">{stats.completed} of {stats.totalCount} completed</p>
          </div>
        </div>

        {/* Average Donation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm font-medium">Avg. Donation</p>
            <span className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">
            RM {stats.avgDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-sm mt-2">per transaction</p>
        </div>
      </div>

      {/* Transaction Status Pills */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link
          href={`/admin/dashboard/donations?status=completed${currentEnv !== 'all' ? `&environment=${currentEnv}` : ''}`}
          className="bg-emerald-50 hover:bg-emerald-100 rounded-xl p-4 border border-emerald-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-900 font-bold text-2xl">{stats.completed}</p>
              <p className="text-emerald-600 text-sm font-medium">Completed</p>
            </div>
          </div>
        </Link>
        <Link
          href={`/admin/dashboard/donations?status=pending${currentEnv !== 'all' ? `&environment=${currentEnv}` : ''}`}
          className="bg-amber-50 hover:bg-amber-100 rounded-xl p-4 border border-amber-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-900 font-bold text-2xl">{stats.pending}</p>
              <p className="text-amber-600 text-sm font-medium">Pending</p>
            </div>
          </div>
        </Link>
        <Link
          href={`/admin/dashboard/donations?status=failed${currentEnv !== 'all' ? `&environment=${currentEnv}` : ''}`}
          className="bg-red-50 hover:bg-red-100 rounded-xl p-4 border border-red-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-red-900 font-bold text-2xl">{stats.failed}</p>
              <p className="text-red-600 text-sm font-medium">Failed</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <DonationFilters
        projects={projectsForFilter}
        currentParams={params}
        hasSandboxDonations={hasSandboxDonations}
      />

      {/* Donations Table */}
      <DonationsTable donations={donationsList} showEnvironment={currentEnv === 'all'} />

      {/* Results Summary */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3">
          <p className="text-gray-500">
            Showing <span className="font-semibold text-foundation-charcoal">{donationsList.length}</span> donation{donationsList.length !== 1 ? 's' : ''}
            {params.status && params.status !== 'all' && (
              <span className="ml-1 text-gray-400">({params.status})</span>
            )}
            {currentEnv !== 'all' && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                currentEnv === 'sandbox'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {currentEnv}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-600">Failed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
