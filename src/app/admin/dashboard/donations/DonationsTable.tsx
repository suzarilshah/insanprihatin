'use client'

import { useState } from 'react'

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
}

interface DonationsTableProps {
  donations: Donation[]
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
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

export default function DonationsTable({ donations }: DonationsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [resendingReceipt, setResendingReceipt] = useState<string | null>(null)
  const [resendResult, setResendResult] = useState<{ id: string; success: boolean; message: string } | null>(null)

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

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
    setResendResult(null)
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 font-medium w-10"></th>
              <th className="px-6 py-4 font-medium">Donor</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">Reference</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Receipt</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <>
                <tr
                  key={donation.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer ${
                    expandedRow === donation.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => toggleRow(donation.id)}
                >
                  <td className="px-6 py-4">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedRow === donation.id ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
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
                      {donation.currency || 'MYR'} {(donation.amount / 100).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="font-mono text-sm text-gray-500">
                      {donation.paymentReference || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {donation.receiptNumber ? (
                      <span className="font-mono text-sm text-teal-600">
                        {donation.receiptNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[donation.paymentStatus || 'pending']
                      }`}
                    >
                      {donation.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {donation.paymentStatus === 'completed' && donation.receiptNumber && (
                        <button
                          onClick={() => handleResendReceipt(donation)}
                          disabled={resendingReceipt === donation.id}
                          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
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
                      <a
                        href={`/api/donations/receipt/${donation.paymentReference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors ${
                          donation.paymentStatus !== 'completed' ? 'opacity-50 pointer-events-none' : ''
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
                  <tr key={`${donation.id}-expanded`} className="bg-gray-50 border-b border-gray-100">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Donor Details */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Donor Details</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">{donation.donorName || 'Anonymous'}</p>
                            {donation.donorEmail && <p className="text-gray-600">{donation.donorEmail}</p>}
                            {donation.donorPhone && <p className="text-gray-600">{donation.donorPhone}</p>}
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Details</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">Method: {donation.paymentMethod || 'FPX'}</p>
                            <p className="text-gray-600">Attempts: {donation.paymentAttempts || 1}</p>
                            {donation.completedAt && (
                              <p className="text-gray-600">Completed: {formatDate(donation.completedAt)}</p>
                            )}
                          </div>
                        </div>

                        {/* Receipt Info */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receipt Info</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">
                              Receipt: {donation.receiptNumber || 'Not generated'}
                            </p>
                            <p className="text-gray-600 font-mono text-xs">
                              Ref: {donation.paymentReference}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Additional Info</p>
                          <div className="space-y-1 text-sm">
                            {donation.message && (
                              <p className="text-gray-600 italic">&ldquo;{donation.message}&rdquo;</p>
                            )}
                            {donation.failureReason && (
                              <p className="text-red-600">Failure: {donation.failureReason}</p>
                            )}
                            {!donation.message && !donation.failureReason && (
                              <p className="text-gray-400">No additional info</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resend Result Message */}
                      {resendResult && resendResult.id === donation.id && (
                        <div
                          className={`mt-4 p-3 rounded-lg text-sm ${
                            resendResult.success
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {resendResult.message}
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
