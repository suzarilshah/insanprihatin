'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const DONATION_AMOUNTS = [50, 100, 250]

export default function CTA() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setError(null)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(0)
    setError(null)
  }

  const handleQuickDonate = async () => {
    if (!finalAmount || finalAmount < 1) {
      setError('Please select or enter a valid donation amount')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'MYR',
          program: selectedProgram,
          isAnonymous: true, // Quick donations are anonymous by default
          donorName: 'Quick Donor',
          donorEmail: 'quickdonation@yayasaninsanprihatin.org',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process donation')
      }

      // If there's a redirect URL (payment gateway), go there
      if (data.redirectUrl) {
        if (data.paymentMethod === 'toyyibpay') {
          window.location.href = data.redirectUrl
        } else {
          // For manual payment, go to success page with bank details
          router.push(`/donate/success?ref=${data.paymentReference}&method=manual`)
        }
      } else {
        // Fallback to success page
        router.push(`/donate/success?ref=${data.paymentReference}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-foundation-charcoal via-gray-900 to-foundation-charcoal" />
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-600/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
              <span className="text-amber-400 font-medium uppercase tracking-wider text-sm">Join Us</span>
            </div>

            <h2 className="heading-section text-white mb-6">
              Be Part of Something{' '}
              <span className="text-gradient-amber">Greater</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Your contribution, no matter the size, creates ripples of positive change.
              Join our growing community of supporters who are helping us build a more compassionate Malaysia.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/donate" className="btn-secondary">
                Donate Now
              </Link>
              <Link href="/contact?type=volunteer" className="btn-outline border-white/30 text-white hover:bg-white hover:text-foundation-charcoal">
                Become a Volunteer
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-4">Trusted by leading organizations</p>
              <div className="flex items-center gap-8 opacity-50">
                {/* Partner logo placeholders */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-8 bg-white/20 rounded" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Donation Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-elevated">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14">
                  <Image
                    src="/images/logo.png"
                    alt="Yayasan Insan Prihatin"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal">
                    Quick Donation
                  </h3>
                  <p className="text-gray-500 text-sm">100% goes to our programs</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Amount Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    disabled={isSubmitting}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      selectedAmount === amount && !customAmount
                        ? 'bg-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-foundation-charcoal hover:bg-teal-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    RM {amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RM</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    disabled={isSubmitting}
                    min="1"
                    className="input-elegant pl-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select program (optional)
                </label>
                <select
                  className="input-elegant"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="general">General Fund</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="community">Community Development</option>
                </select>
              </div>

              {/* Amount Summary */}
              {finalAmount > 0 && (
                <div className="mb-4 p-3 bg-teal-50 rounded-xl text-center">
                  <span className="text-sm text-gray-600">You are donating </span>
                  <span className="font-bold text-teal-600">RM {finalAmount}</span>
                  <span className="text-sm text-gray-600"> to {selectedProgram === 'general' ? 'General Fund' : selectedProgram}</span>
                </div>
              )}

              <button
                onClick={handleQuickDonate}
                disabled={isSubmitting || !finalAmount || finalAmount < 1}
                className="block w-full btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Donate Now'
                )}
              </button>

              <p className="text-center text-gray-400 text-xs mt-4">
                🔒 Secure payment powered by trusted partners
              </p>

              {/* Link to full donate page */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Want to include your details?{' '}
                <Link href="/donate" className="text-teal-600 hover:underline font-medium">
                  Donate with receipt →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
