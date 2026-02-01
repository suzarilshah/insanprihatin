'use client'

import Link from 'next/link'

interface EnvironmentBannerProps {
  environment: string
  sandboxCount: number
  productionCount: number
}

export default function EnvironmentBanner({
  environment,
  sandboxCount,
  productionCount,
}: EnvironmentBannerProps) {
  if (environment === 'sandbox') {
    return (
      <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Sandbox Mode Active</h3>
              <p className="text-sm text-amber-700">
                You are viewing test transactions from the ToyyibPay sandbox environment.
                These are not real donations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard/donations?environment=production"
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Production
            </Link>
            <Link
              href="/admin/dashboard/donations"
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show mixed environment notice when viewing all and sandbox donations exist
  if (environment === 'all' && sandboxCount > 0) {
    return (
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Mixed Environment View</h3>
              <p className="text-sm text-blue-700">
                Showing <span className="font-medium">{productionCount}</span> production and{' '}
                <span className="font-medium text-amber-600">{sandboxCount}</span> sandbox donations.
                Filter by environment for accurate totals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard/donations?environment=production"
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Production Only
            </Link>
            <Link
              href="/admin/dashboard/donations?environment=sandbox"
              className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Sandbox Only
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
