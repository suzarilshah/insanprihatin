'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface DonationDetails {
  id: string
  donorName: string
  amount: number
  currency: string
  status: string
  reference: string
  message: string | null
  createdAt: string
}

const bankDetails = {
  bankName: 'Maybank',
  accountNumber: '5123-4567-8910',
  accountName: 'Yayasan Insan Prihatin',
}

export default function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref')
  const method = searchParams.get('method')
  const amountParam = searchParams.get('amount')

  const [donation, setDonation] = useState<DonationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDonation() {
      if (!reference) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/donations?reference=${reference}`)
        const data = await response.json()

        if (data.success && data.donation) {
          setDonation(data.donation)
        }
      } catch (error) {
        console.error('Error fetching donation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonation()
  }, [reference])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const displayAmount = donation?.amount || (amountParam ? parseInt(amountParam) : 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <section className="section-padding">
      <div className="container-wide max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center shadow-glow-teal"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          <h1 className="heading-section text-foundation-charcoal mb-4">
            Thank You for Your{' '}
            <span className="text-gradient">Generosity!</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Your donation has been recorded successfully. Together, we are making a difference in the lives of those who need it most.
          </p>
        </motion.div>

        {/* Donation Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elegant p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="relative w-16 h-16">
              <Image
                src="/images/logo.png"
                alt="Yayasan Insan Prihatin"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-foundation-charcoal">
                Donation Receipt
              </h2>
              <p className="text-gray-500 text-sm">
                Reference: <span className="font-mono">{reference || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="font-display text-3xl font-bold text-teal-600">
                RM {displayAmount.toLocaleString()}
              </span>
            </div>

            {donation?.donorName && donation.donorName !== 'Anonymous' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Donor</span>
                <span className="font-medium text-foundation-charcoal">{donation.donorName}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                donation?.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {donation?.status === 'completed' ? 'Completed' : 'Pending Payment'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="text-foundation-charcoal">
                {donation?.createdAt
                  ? new Date(donation.createdAt).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date().toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                }
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bank Transfer Instructions (for manual payment) */}
        {method === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elegant p-8 mb-8 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-1">
                  Complete Your Payment
                </h3>
                <p className="text-gray-600 text-sm">
                  Please transfer the donation amount to our bank account below
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-white rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bank</span>
                <span className="font-medium text-foundation-charcoal">{bankDetails.bankName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foundation-charcoal">{bankDetails.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber.replace(/-/g, ''), 'account')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy account number"
                  >
                    {copied === 'account' ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Name</span>
                <span className="font-medium text-foundation-charcoal">{bankDetails.accountName}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-600">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-teal-600">{reference}</span>
                  <button
                    onClick={() => copyToClipboard(reference || '', 'reference')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy reference"
                  >
                    {copied === 'reference' ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-amber-700 text-sm mt-4 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Please include the reference number in your bank transfer description so we can match your payment.
                Your donation status will be updated once we receive and verify the transfer.
              </span>
            </p>
          </motion.div>
        )}

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elegant p-8 mb-8"
        >
          <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            What Happens Next?
          </h3>
          <div className="space-y-4">
            {[
              { icon: '📧', title: 'Confirmation Email', desc: 'You will receive a confirmation email with your donation details.' },
              { icon: '📜', title: 'Tax Receipt', desc: 'An official tax-deductible receipt will be sent within 7 working days.' },
              { icon: '📊', title: 'Impact Report', desc: 'We will share quarterly updates on how your donation is making a difference.' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-medium text-foundation-charcoal">{item.title}</div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">Help us spread the word</p>
          <div className="flex justify-center gap-4 mb-8">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://yayasaninsanprihatin.org/donate')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
              </svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just donated to Yayasan Insan Prihatin! Join me in making a difference.')}&url=${encodeURIComponent('https://yayasaninsanprihatin.org/donate')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent('I just donated to Yayasan Insan Prihatin! Join me in making a difference. https://yayasaninsanprihatin.org/donate')}`}
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
            <Link href="/" className="btn-outline">
              Return Home
            </Link>
            <Link href="/donate" className="btn-primary">
              Make Another Donation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
