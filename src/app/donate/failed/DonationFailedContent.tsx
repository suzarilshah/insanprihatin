'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface DonationInfo {
  reference?: string
  amount?: number
  failureReason?: string
  status?: string
}

// Static translations for non-locale routes
const translations = {
  title: 'Payment Not Completed',
  description: "We couldn't process your payment. This could be due to a cancelled transaction or a bank issue.",
  paymentDetails: 'Payment Details',
  amount: 'Amount',
  reference: 'Reference',
  tryAgain: 'Try Again',
  processing: 'Processing...',
  startNew: 'Start New Donation',
  needHelpTitle: 'Need Help?',
  needHelpDescription: "If you continue to experience issues, please contact our support team. We're here to help!",
  commonIssuesTitle: 'Common Issues',
  insufficientFunds: 'Insufficient funds - Check your account balance',
  timeout: 'Transaction timeout - The session expired, try again',
  declined: 'Bank declined - Contact your bank for more details',
  networkError: 'Network error - Check your internet connection',
}

export default function DonationFailedContent() {
  const searchParams = useSearchParams()
  const [donation, setDonation] = useState<DonationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reference = searchParams.get('ref')
  const reason = searchParams.get('reason')

  useEffect(() => {
    async function fetchDonation() {
      if (!reference) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/donations?reference=${reference}`)
        if (response.ok) {
          const data = await response.json()
          if (data.donation) {
            setDonation({
              reference: data.donation.reference,
              amount: data.donation.amount,
              failureReason: data.donation.failureReason || reason || translations.description,
              status: data.donation.status,
            })
          }
        }
      } catch (err) {
        console.error('Failed to fetch donation:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDonation()
  }, [reference, reason])

  const handleRetry = async () => {
    if (!reference) return

    setIsRetrying(true)
    setError(null)

    try {
      const response = await fetch('/api/donations/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate retry')
      }

      // Redirect to payment gateway
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry payment. Please try again.')
      setIsRetrying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <div className="container-custom py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>

          {/* Title */}
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foundation-charcoal mb-4">
            {translations.title}
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {donation?.failureReason || reason || translations.description}
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Donation Details */}
          {donation && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4">{translations.paymentDetails}</h3>
              <div className="space-y-3 text-sm">
                {donation.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{translations.amount}</span>
                    <span className="font-semibold">RM {donation.amount.toLocaleString()}</span>
                  </div>
                )}
                {donation.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{translations.reference}</span>
                    <span className="font-mono text-xs">{donation.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {reference && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {translations.processing}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {translations.tryAgain}
                  </>
                )}
              </button>
            )}

            <Link
              href="/donate"
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {translations.startNew}
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <h3 className="font-medium text-amber-900 mb-2">{translations.needHelpTitle}</h3>
            <p className="text-sm text-amber-800 mb-4">
              {translations.needHelpDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:admin@insanprihatin.org"
                className="text-amber-700 hover:text-amber-900 underline"
              >
                admin@insanprihatin.org
              </a>
              <span className="text-amber-600 hidden sm:inline">|</span>
              <a
                href="tel:+60123456789"
                className="text-amber-700 hover:text-amber-900 underline"
              >
                +60 12-345 6789
              </a>
            </div>
          </div>

          {/* Common Issues */}
          <div className="mt-8 text-left bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">{translations.commonIssuesTitle}</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{translations.insufficientFunds}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{translations.timeout}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{translations.declined}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{translations.networkError}</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
