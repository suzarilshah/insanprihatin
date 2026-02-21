'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Donation {
  id: string
  donorName: string | null
  donorEmail: string | null
  donorPhone: string | null
  amount: number
  currency: string | null
  paymentStatus: string | null
  paymentReference: string | null
  receiptNumber: string | null
  message: string | null
  isAnonymous: boolean | null
  projectId: string | null
  createdAt: Date
  completedAt: Date | null
  paymentMethod: string | null
  paymentAttempts: number | null
  failureReason: string | null
  environment: string | null
}

interface DonationsTableProps {
  donations: Donation[]
  showEnvironment?: boolean
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  pending: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  failed: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  expired: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  refunded: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
}

// Helper to check if a donation is stale (pending for more than 24 hours)
function isStale(createdAt: Date): boolean {
  const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  return hoursSinceCreation > 24
}

// Helper to get time since creation
function getTimeSince(createdAt: Date): string {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
  if (hours < 1) return 'Less than 1 hour ago'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
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

export default function DonationsTable({ donations, showEnvironment = false }: DonationsTableProps) {
  const router = useRouter()
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [resendingReceipt, setResendingReceipt] = useState<string | null>(null)
  const [refreshingStatus, setRefreshingStatus] = useState<string | null>(null)
  const [markingExpired, setMarkingExpired] = useState<string | null>(null)
  const [resendResult, setResendResult] = useState<{ id: string; success: boolean; message: string } | null>(null)
  const [actionResult, setActionResult] = useState<{ id: string; success: boolean; message: string } | null>(null)

  const handleResendReceipt = async (donation: Donation) => {
    if (!donation.receiptNumber || !donation.donorEmail) return

    setResendingReceipt(donation.id)
    setResendResult(null)

    try {
      const response = await fetch(`/api/donations/receipt/${donation.paymentReference}/resend`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResendResult({ id: donation.id, success: true, message: 'Receipt sent successfully!' })
      } else {
        setResendResult({ id: donation.id, success: false, message: data.error || 'Failed to send receipt' })
      }
    } catch {
      setResendResult({ id: donation.id, success: false, message: 'Network error. Please try again.' })
    } finally {
      setResendingReceipt(null)
    }
  }

  const handleRefreshStatus = async (donation: Donation) => {
    setRefreshingStatus(donation.id)
    setActionResult(null)

    try {
      const response = await fetch('/api/admin/donations/refresh-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: donation.paymentReference }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.noChange) {
          setActionResult({ id: donation.id, success: true, message: data.message || 'Status unchanged' })
        } else {
          setActionResult({ id: donation.id, success: true, message: data.message || 'Status updated!' })
          // Refresh the page to show updated data
          router.refresh()
        }
      } else {
        setActionResult({ id: donation.id, success: false, message: data.error || 'Failed to refresh status' })
      }
    } catch {
      setActionResult({ id: donation.id, success: false, message: 'Network error. Please try again.' })
    } finally {
      setRefreshingStatus(null)
    }
  }

  const handleMarkExpired = async (donation: Donation) => {
    if (!confirm('Are you sure you want to mark this donation as expired? This action cannot be undone.')) {
      return
    }

    setMarkingExpired(donation.id)
    setActionResult(null)

    try {
      const response = await fetch('/api/admin/donations/mark-expired', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: donation.paymentReference,
          reason: 'Payment not received - marked expired by admin',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setActionResult({ id: donation.id, success: true, message: 'Donation marked as expired' })
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setActionResult({ id: donation.id, success: false, message: data.error || 'Failed to mark as expired' })
      }
    } catch {
      setActionResult({ id: donation.id, success: false, message: 'Network error. Please try again.' })
    } finally {
      setMarkingExpired(null)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
    setResendResult(null)
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations found</h3>
        <p className="text-gray-500">There are no donations matching your current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50/80 uppercase tracking-wider">
              <th className="px-5 py-4 font-semibold w-10"></th>
              <th className="px-5 py-4 font-semibold">Donor</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold hidden lg:table-cell">Reference</th>
              <th className="px-5 py-4 font-semibold hidden md:table-cell">Receipt</th>
              {showEnvironment && (
                <th className="px-5 py-4 font-semibold hidden xl:table-cell">Environment</th>
              )}
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold hidden sm:table-cell">Date</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {donations.map((donation) => (
              <>
                <tr
                  key={donation.id}
                  className={`hover:bg-gray-50/70 cursor-pointer transition-colors ${
                    expandedRow === donation.id ? 'bg-gray-50' : ''
                  } ${donation.environment === 'sandbox' ? 'bg-amber-50/30' : ''}`}
                  onClick={() => toggleRow(donation.id)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          expandedRow === donation.id ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold text-sm">
                        {donation.isAnonymous ? '?' : (donation.donorName?.[0]?.toUpperCase() || 'U')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foundation-charcoal">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Unknown'}
                          </p>
                          {donation.environment === 'sandbox' && !showEnvironment && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded font-medium">
                              TEST
                            </span>
                          )}
                        </div>
                        {donation.donorEmail && !donation.isAnonymous && (
                          <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-foundation-charcoal text-lg">
                      <span className="text-gray-400 text-sm font-normal">{donation.currency || 'MYR'}</span>{' '}
                      {(donation.amount / 100).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {donation.paymentReference || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {donation.receiptNumber ? (
                      <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {donation.receiptNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  {showEnvironment && (
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          donation.environment === 'sandbox'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {donation.environment === 'sandbox' ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )}
                        {donation.environment === 'sandbox' ? 'Sandbox' : 'Production'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          statusColors[donation.paymentStatus || 'pending']
                        }`}
                      >
                        {statusIcons[donation.paymentStatus || 'pending']}
                        {(donation.paymentStatus || 'pending').charAt(0).toUpperCase() + (donation.paymentStatus || 'pending').slice(1)}
                      </span>
                      {donation.paymentStatus === 'pending' && isStale(donation.createdAt) && (
                        <span className="text-[10px] text-orange-600 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Stale - {getTimeSince(donation.createdAt)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString('en-MY', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(donation.createdAt).toLocaleTimeString('en-MY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {/* Refresh Status button for pending/failed donations */}
                      {(donation.paymentStatus === 'pending' || donation.paymentStatus === 'failed') && (
                        <button
                          onClick={() => handleRefreshStatus(donation)}
                          disabled={refreshingStatus === donation.id}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Refresh status from ToyyibPay"
                        >
                          {refreshingStatus === donation.id ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </button>
                      )}
                      {/* Mark Expired button for stale pending donations */}
                      {donation.paymentStatus === 'pending' && isStale(donation.createdAt) && (
                        <button
                          onClick={() => handleMarkExpired(donation)}
                          disabled={markingExpired === donation.id}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as expired"
                        >
                          {markingExpired === donation.id ? (
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      {/* Resend Receipt button for completed donations */}
                      {donation.paymentStatus === 'completed' && donation.receiptNumber && (
                        <button
                          onClick={() => handleResendReceipt(donation)}
                          disabled={resendingReceipt === donation.id}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Resend Receipt"
                        >
                          {resendingReceipt === donation.id ? (
                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                      {/* Download Receipt button */}
                      <a
                        href={`/api/donations/receipt/${donation.paymentReference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors ${
                          donation.paymentStatus !== 'completed' ? 'opacity-30 pointer-events-none' : ''
                        }`}
                        title="Download Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRow === donation.id && (
                  <tr key={`${donation.id}-expanded`} className="bg-gray-50/80 border-b border-gray-100">
                    <td colSpan={showEnvironment ? 9 : 8} className="px-5 py-5">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Donor Details */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Donor Details
                          </p>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-gray-900">{donation.donorName || 'Anonymous'}</p>
                            {donation.donorEmail && <p className="text-gray-600">{donation.donorEmail}</p>}
                            {donation.donorPhone && <p className="text-gray-600">{donation.donorPhone}</p>}
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payment Details
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Method</span>
                              <span className="font-medium">{donation.paymentMethod?.toUpperCase() || 'FPX'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Attempts</span>
                              <span className="font-medium">{donation.paymentAttempts || 1}</span>
                            </div>
                            {donation.environment && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Environment</span>
                                <span className={`font-medium ${
                                  donation.environment === 'sandbox' ? 'text-amber-600' : 'text-emerald-600'
                                }`}>
                                  {donation.environment.charAt(0).toUpperCase() + donation.environment.slice(1)}
                                </span>
                              </div>
                            )}
                            {donation.completedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Completed</span>
                                <span className="font-medium text-xs">{formatDate(donation.completedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Receipt Info */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Receipt Info
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Receipt No.</span>
                              <span className="font-mono text-xs font-medium">
                                {donation.receiptNumber || 'Not generated'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500">Reference</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {donation.paymentReference}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Additional Info
                          </p>
                          <div className="space-y-2 text-sm">
                            {donation.message && (
                              <p className="text-gray-600 italic bg-gray-50 p-2 rounded">&ldquo;{donation.message}&rdquo;</p>
                            )}
                            {donation.failureReason && (
                              <div className="bg-red-50 text-red-700 p-2 rounded text-xs">
                                <span className="font-semibold">Failure:</span> {donation.failureReason}
                              </div>
                            )}
                            {!donation.message && !donation.failureReason && (
                              <p className="text-gray-400 italic">No additional info</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resend Result Message */}
                      {resendResult && resendResult.id === donation.id && (
                        <div
                          className={`mt-4 p-4 rounded-xl text-sm flex items-center gap-3 ${
                            resendResult.success
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {resendResult.success ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {resendResult.message}
                        </div>
                      )}

                      {/* Action Result Message (refresh status, mark expired) */}
                      {actionResult && actionResult.id === donation.id && (
                        <div
                          className={`mt-4 p-4 rounded-xl text-sm flex items-center gap-3 ${
                            actionResult.success
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {actionResult.success ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {actionResult.message}
                        </div>
                      )}

                      {/* Pending Payment Actions Info */}
                      {(donation.paymentStatus === 'pending' || donation.paymentStatus === 'failed') && (
                        <div className="mt-4 p-4 rounded-xl text-sm bg-blue-50 border border-blue-200">
                          <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Payment Status Actions
                          </p>
                          <p className="text-blue-800 text-xs mb-2">
                            {donation.paymentStatus === 'pending'
                              ? 'This payment is pending. You can refresh the status from ToyyibPay to check if it has been completed.'
                              : 'This payment has failed. You can refresh the status to see if the user has retried successfully.'}
                          </p>
                          {donation.paymentStatus === 'pending' && isStale(donation.createdAt) && (
                            <p className="text-orange-700 text-xs bg-orange-50 p-2 rounded mt-2">
                              <strong>Note:</strong> This donation has been pending for {getTimeSince(donation.createdAt)}.
                              Consider marking it as expired if the donor is unlikely to complete the payment.
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
