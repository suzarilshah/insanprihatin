'use client'

import { useState, useTransition } from 'react'
import { toggleDonationsClosed } from '@/lib/actions/content'

interface DonationToggleProps {
  initialClosed: boolean
  initialReason: { en: string; ms: string } | null
  closedAt: string | null
  closedBy: string | null
}

export default function DonationToggle({
  initialClosed,
  initialReason,
  closedAt,
  closedBy,
}: DonationToggleProps) {
  const [isClosed, setIsClosed] = useState(initialClosed)
  const [reason, setReason] = useState(initialReason || { en: '', ms: '' })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastClosedAt] = useState(closedAt)
  const [lastClosedBy] = useState(closedBy)

  const handleToggleClick = () => {
    if (!isClosed) {
      // Closing donations — show confirmation dialog
      setShowConfirmDialog(true)
    } else {
      // Re-opening donations — execute immediately
      performToggle(false)
    }
  }

  const performToggle = (newClosed: boolean) => {
    setMessage(null)
    startTransition(async () => {
      try {
        await toggleDonationsClosed({
          closed: newClosed,
          reason: newClosed && (reason.en.trim() || reason.ms.trim()) ? reason : null,
        })
        setIsClosed(newClosed)
        setShowConfirmDialog(false)
        setMessage({
          type: 'success',
          text: newClosed
            ? 'Donations have been closed. The public donation page now shows a closure notice.'
            : 'Donations are now open. The public donation page is accepting donations again.',
        })
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } catch {
        setMessage({ type: 'error', text: 'Failed to update donation status. Please try again.' })
      }
    })
  }

  return (
    <>
      {/* Status Badge + Toggle Row */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
          isClosed
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isClosed ? 'bg-red-500' : 'bg-emerald-500'
          }`} />
          {isClosed ? 'Donations Closed' : 'Accepting Donations'}
        </span>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            {isClosed ? 'Closed' : 'Open'}
          </span>
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              !isClosed ? 'bg-teal-600' : 'bg-gray-200'
            }`}
            title={isClosed ? 'Click to re-open donations' : 'Click to close donations'}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                !isClosed ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Closed Info Banner (shown when donations are closed) */}
      {isClosed && (
        <div className="mt-4 -mx-0 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Donations are currently closed
              </p>
              <p className="text-xs text-red-600 mt-1">
                The public donation page is showing a closure notice to visitors.
                {lastClosedBy && (
                  <span> Closed by <strong>{lastClosedBy}</strong></span>
                )}
                {lastClosedAt && (
                  <span> on {new Date(lastClosedAt).toLocaleDateString('en-MY', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                )}
              </p>
              {initialReason && (initialReason.en || initialReason.ms) && (
                <p className="text-xs text-red-600 mt-1">
                  Reason: {initialReason.en || initialReason.ms}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isPending && setShowConfirmDialog(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8">
            {/* Warning Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Close Donations?</h3>
                <p className="text-sm text-gray-500">This will immediately affect the public donation page</p>
              </div>
            </div>

            {/* Warning Info */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <p className="text-sm text-amber-800">
                When donations are closed, visitors will see a closure notice instead of the donation form.
                No new donations can be processed until you re-open.
              </p>
            </div>

            {/* Optional Reason Fields */}
            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium text-gray-700">
                Closure reason <span className="text-gray-400 font-normal">(optional, shown to visitors)</span>
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">English</label>
                <input
                  type="text"
                  value={reason.en}
                  onChange={(e) => setReason({ ...reason, en: e.target.value })}
                  placeholder="e.g. We are undergoing an annual audit"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Bahasa Melayu</label>
                <input
                  type="text"
                  value={reason.ms}
                  onChange={(e) => setReason({ ...reason, ms: e.target.value })}
                  placeholder="cth. Kami sedang menjalani audit tahunan"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => performToggle(true)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Confirm Close
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
