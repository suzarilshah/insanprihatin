'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

interface DonationDetails {
  id: string
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  paymentStatus: string
  paymentReference: string
  receiptNumber: string | null
  projectTitle: string | null
  message: string | null
  createdAt: string
  completedAt: string | null
}

type VerificationStatus = 'loading' | 'success' | 'pending' | 'failed' | 'not_found'

export default function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ToyyibPay return parameters
  const reference = searchParams.get('ref')
  const statusId = searchParams.get('status_id')
  const billcode = searchParams.get('billcode')
  const transactionId = searchParams.get('transaction_id')

  const [donation, setDonation] = useState<DonationDetails | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('loading')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setVerificationStatus('not_found')
      return
    }

    try {
      // Use the verify endpoint to check payment status
      const response = await fetch(`/api/donations/verify?reference=${reference}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setVerificationStatus('not_found')
          return
        }
        throw new Error(data.error || 'Verification failed')
      }

      setDonation(data.donation)

      // Determine status based on payment status
      const status = data.donation.paymentStatus
      if (status === 'completed') {
        setVerificationStatus('success')
      } else if (status === 'failed') {
        // Redirect to failed page
        router.replace(`/donate/failed?ref=${reference}&reason=${encodeURIComponent(data.donation.failureReason || 'Payment was not completed')}`)
        return
      } else {
        setVerificationStatus('pending')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      // If ToyyibPay returned status_id, use that
      if (statusId === '1') {
        setVerificationStatus('success')
      } else if (statusId === '3') {
        router.replace(`/donate/failed?ref=${reference}`)
        return
      } else {
        setVerificationStatus('pending')
      }
    }
  }, [reference, statusId, router])

  useEffect(() => {
    verifyPayment()
  }, [verifyPayment])

  const handleDownloadReceipt = async () => {
    if (!reference || !donation?.receiptNumber) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      const response = await fetch(`/api/donations/receipt/${reference}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to download receipt')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `YIP-Receipt-${donation.receiptNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      setDownloadError(error instanceof Error ? error.message : 'Failed to download receipt')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendReceipt = async () => {
    if (!reference || !donation?.receiptNumber) return

    setIsSendingEmail(true)
    setEmailStatus(null)

    try {
      const response = await fetch(`/api/donations/receipt/${reference}/resend`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send receipt email')
      }

      setEmailStatus({
        type: 'success',
        message: `Receipt sent successfully to ${donation.donorEmail}`,
      })
    } catch (error) {
      console.error('Send receipt error:', error)
      setEmailStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send receipt email. Please try again.',
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </motion.div>
      </div>
    )
  }

  // Not found state
  if (verificationStatus === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="container-custom py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-gray-900 mb-4">
              Donation Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn&apos;t find a donation with that reference. Please check your email for confirmation or contact us for assistance.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Make a Donation
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container-custom py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Success Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
              >
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foundation-charcoal mb-3">
                Thank You for Your Generosity!
              </h1>
              <p className="text-lg text-gray-600">
                Your payment has been received successfully.
              </p>
            </div>

            {/* Receipt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 bg-white rounded-xl p-2">
                      <Image
                        src="/images/logo.png"
                        alt="Yayasan Insan Prihatin"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold">
                        Donation Receipt
                      </h2>
                      <p className="text-teal-100 text-sm">
                        Yayasan Insan Prihatin
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-100 text-sm">Receipt No.</div>
                    <div className="font-mono font-semibold">
                      {donation?.receiptNumber || 'Processing...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Amount */}
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                  <div className="text-gray-500 text-sm mb-1">Amount Donated</div>
                  <div className="font-display text-4xl font-bold text-teal-600">
                    RM {(donation?.amount || 0).toLocaleString()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {donation?.donorName && donation.donorName !== 'Anonymous' && (
                    <div>
                      <div className="text-gray-500 text-sm">Donor Name</div>
                      <div className="font-medium text-gray-900">{donation.donorName}</div>
                    </div>
                  )}

                  {donation?.donorEmail && (
                    <div>
                      <div className="text-gray-500 text-sm">Email</div>
                      <div className="font-medium text-gray-900">{donation.donorEmail}</div>
                    </div>
                  )}

                  {donation?.projectTitle && (
                    <div>
                      <div className="text-gray-500 text-sm">Project</div>
                      <div className="font-medium text-gray-900">{donation.projectTitle}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-gray-500 text-sm">Date</div>
                    <div className="font-medium text-gray-900">
                      {donation?.completedAt
                        ? new Date(donation.completedAt).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : new Date().toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-sm">Reference</div>
                    <div className="font-mono text-sm text-gray-900">{reference}</div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-sm">Status</div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Completed
                    </div>
                  </div>
                </div>

                {donation?.message && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Your Message</div>
                    <div className="text-gray-700 italic">&ldquo;{donation.message}&rdquo;</div>
                  </div>
                )}
              </div>

              {/* Download Button */}
              {donation?.receiptNumber && (
                <div className="px-8 pb-8">
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Receipt (PDF)
                      </>
                    )}
                  </button>
                  {downloadError && (
                    <p className="text-red-500 text-sm text-center mt-2">{downloadError}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Tax Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Tax Deduction Notice</h3>
                  <p className="text-sm text-amber-800">
                    Yayasan Insan Prihatin is a registered charitable organization. Your donation may be eligible for tax deduction under Section 44(6) of the Income Tax Act 1967. Please keep this receipt for your records.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Receipt Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-teal-900 mb-1">Email Receipt</h3>
                  <p className="text-sm text-teal-800 mb-4">
                    Get your official receipt sent to <strong>{donation?.donorEmail || 'your email'}</strong>.
                  </p>

                  {/* Email Status Messages */}
                  {emailStatus && (
                    <div className={`mb-3 p-3 rounded-lg text-sm ${
                      emailStatus.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {emailStatus.type === 'success' ? (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {emailStatus.message}
                      </div>
                    </div>
                  )}

                  {/* Send Receipt Button */}
                  {donation?.receiptNumber && donation?.donorEmail && (
                    <button
                      onClick={handleSendReceipt}
                      disabled={isSendingEmail}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Receipt to Email
                        </>
                      )}
                    </button>
                  )}

                  <p className="text-xs text-teal-700 mt-3">
                    Don&apos;t see it? Check your spam folder or click above to resend.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Share & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-gray-600 mb-4">Help spread kindness</p>
              <div className="flex justify-center gap-3 mb-8">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://insanprihatin.org/donate')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just donated to Yayasan Insan Prihatin! Join me in making a difference.')}&url=${encodeURIComponent('https://insanprihatin.org/donate')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('I just donated to Yayasan Insan Prihatin! Join me in making a difference. https://insanprihatin.org/donate')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Return Home
                </Link>
                <Link
                  href="/donate"
                  className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                >
                  Donate Again
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Pending state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container-custom py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Pending Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200"
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foundation-charcoal mb-3">
              Payment Processing
            </h1>
            <p className="text-lg text-gray-600">
              Your payment is being verified. This may take a few moments.
            </p>
          </div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-14 h-14 bg-gray-100 rounded-xl p-2">
                <Image
                  src="/images/logo.png"
                  alt="Yayasan Insan Prihatin"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foundation-charcoal">
                  Donation Details
                </h2>
                <p className="text-gray-500 text-sm">
                  Reference: <span className="font-mono">{reference || 'N/A'}</span>
                </p>
              </div>
            </div>

            {donation && (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-display text-2xl font-bold text-teal-600">
                    RM {donation.amount.toLocaleString()}
                  </span>
                </div>

                {donation.donorName && donation.donorName !== 'Anonymous' && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Donor</span>
                    <span className="font-medium text-gray-900">{donation.donorName}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Pending Verification
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Your payment is being processed by our payment gateway</li>
                  <li>You will receive an email confirmation once verified</li>
                  <li>If you don&apos;t receive confirmation within 24 hours, please contact us</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={verifyPayment}
              className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </button>
            <Link
              href="/"
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Return Home
            </Link>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8 text-sm text-gray-500"
          >
            Questions? Contact us at{' '}
            <a href="mailto:admin@insanprihatin.org" className="text-teal-600 hover:underline">
              admin@insanprihatin.org
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
