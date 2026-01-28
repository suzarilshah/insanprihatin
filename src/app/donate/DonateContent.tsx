'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

const donationAmounts = [50, 100, 250, 500, 1000, 2500]

const programs = [
  { id: 'general', name: 'General Fund', description: 'Support all our programs' },
  { id: 'education', name: 'Education', description: 'Scholarships & school supplies' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical camps & treatment' },
  { id: 'environment', name: 'Environment', description: 'Green initiatives' },
  { id: 'community', name: 'Community', description: 'Skills training & development' },
]

const impactExamples = [
  { amount: 50, impact: 'Provides school supplies for 1 student' },
  { amount: 100, impact: 'Funds a medical checkup for 5 villagers' },
  { amount: 250, impact: 'Sponsors a month of skills training' },
  { amount: 500, impact: 'Plants 50 trees in rural areas' },
  { amount: 1000, impact: 'Provides a semester scholarship' },
  { amount: 2500, impact: 'Equips a rural classroom' },
]

export default function DonateContent() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('general')
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    anonymous: false,
    message: '',
  })

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-amber-500 via-amber-400 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="donate-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#donate-pattern)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white/10 rounded-full blur-[150px]" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <svg className="w-6 h-6 text-foundation-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-foundation-charcoal font-medium uppercase tracking-wider text-sm">Support Our Mission</span>
            </div>
            <h1 className="heading-display text-foundation-charcoal mb-6">
              Your Generosity<br />
              <span className="text-white">Transforms Lives</span>
            </h1>
            <p className="text-xl text-foundation-charcoal/80 leading-relaxed">
              Every donation, big or small, creates ripples of positive change
              in communities across Malaysia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elegant p-8"
              >
                {/* Donation Type */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Donation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'one-time', label: 'One-Time' },
                      { id: 'monthly', label: 'Monthly' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setDonationType(type.id as 'one-time' | 'monthly')}
                        className={`p-4 rounded-xl border-2 font-medium transition-all ${
                          donationType === type.id
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-teal-200'
                        }`}
                      >
                        {type.label}
                        {type.id === 'monthly' && (
                          <span className="block text-xs text-gray-500 mt-1">
                            Create lasting impact
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Amount (MYR)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {donationAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={`p-4 rounded-xl border-2 font-medium transition-all ${
                          selectedAmount === amount
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-gray-200 hover:border-teal-200 text-foundation-charcoal'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      RM
                    </span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="input-elegant pl-12"
                      min="1"
                    />
                  </div>
                </div>

                {/* Program Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Program
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {programs.map((program) => (
                      <button
                        key={program.id}
                        onClick={() => setSelectedProgram(program.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedProgram === program.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-200'
                        }`}
                      >
                        <div className="font-medium text-foundation-charcoal">
                          {program.name}
                        </div>
                        <div className="text-sm text-gray-500">{program.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Information */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Your Information
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      className="input-elegant"
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                        className="input-elegant"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={donorInfo.phone}
                        onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                        className="input-elegant"
                      />
                    </div>
                    <textarea
                      placeholder="Leave a message (optional)"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                      className="textarea-elegant"
                      rows={3}
                    />
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={donorInfo.anonymous}
                        onChange={(e) => setDonorInfo({ ...donorInfo, anonymous: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-gray-600">Make this donation anonymous</span>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button className="btn-secondary w-full text-lg">
                  {donationType === 'monthly' ? 'Start Monthly Donation' : 'Proceed to Payment'}
                  <span className="ml-2">→</span>
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Secure payment powered by trusted partners
                </p>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elegant p-6 mb-6 sticky top-32"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/images/logo.png"
                      alt="Yayasan Insan Prihatin"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foundation-charcoal">
                      Donation Summary
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {programs.find((p) => p.id === selectedProgram)?.name}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-foundation-charcoal">
                      {finalAmount ? formatCurrency(finalAmount) : 'RM 0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-foundation-charcoal capitalize">
                      {donationType}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-foundation-charcoal">Total</span>
                      <span className="font-display font-bold text-teal-600">
                        {finalAmount ? formatCurrency(finalAmount) : 'RM 0'}
                        {donationType === 'monthly' && <span className="text-sm">/mo</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact */}
                {finalAmount && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-foundation-charcoal text-sm">
                          Your Impact
                        </div>
                        <p className="text-gray-600 text-sm">
                          {impactExamples.find((e) => e.amount <= (finalAmount || 0))?.impact ||
                            'Every contribution matters'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {[
                  { icon: '🔒', text: '100% Secure Payment' },
                  { icon: '📜', text: 'Tax Deductible Receipt' },
                  { icon: '✓', text: 'Registered Foundation' },
                  { icon: '📊', text: 'Transparent Reporting' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-600 text-sm"
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="section-padding bg-foundation-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="heading-subsection text-foundation-charcoal mb-4">
              Other Ways to Support
            </h2>
            <p className="text-gray-600">
              There are many ways to contribute to our mission
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏦',
                title: 'Bank Transfer',
                description: 'Direct transfer to our foundation account',
                details: 'Maybank: 5123-4567-8910\nYayasan Insan Prihatin',
              },
              {
                icon: '🤝',
                title: 'Corporate Giving',
                description: 'Partner with us for CSR initiatives',
                details: 'Contact: partnerships@insanprihatin.org',
              },
              {
                icon: '📦',
                title: 'In-Kind Donations',
                description: 'Donate goods, equipment, or services',
                details: 'Contact us to arrange donation',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elegant p-8 text-center"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{item.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
