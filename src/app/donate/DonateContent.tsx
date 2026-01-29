'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

const donationAmounts = [50, 100, 250, 500, 1000, 2500]

const programs = [
  { id: 'general', name: 'General Fund', description: 'Support all our programs', icon: '🎯', color: 'from-teal-400 to-teal-500' },
  { id: 'education', name: 'Education', description: 'Scholarships & school supplies', icon: '🎓', color: 'from-blue-400 to-blue-500' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical camps & treatment', icon: '🏥', color: 'from-rose-400 to-rose-500' },
  { id: 'environment', name: 'Environment', description: 'Green initiatives', icon: '🌳', color: 'from-emerald-400 to-emerald-500' },
  { id: 'community', name: 'Community', description: 'Skills training & development', icon: '🏘️', color: 'from-amber-400 to-amber-500' },
]

const impactExamples = [
  { amount: 50, impact: 'Provides school supplies for 1 student', icon: '📚' },
  { amount: 100, impact: 'Funds a medical checkup for 5 villagers', icon: '🩺' },
  { amount: 250, impact: 'Sponsors a month of skills training', icon: '🛠️' },
  { amount: 500, impact: 'Plants 50 trees in rural areas', icon: '🌱' },
  { amount: 1000, impact: 'Provides a semester scholarship', icon: '🎓' },
  { amount: 2500, impact: 'Equips a rural classroom', icon: '🏫' },
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
  const [step, setStep] = useState(1)

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount
  const currentImpact = impactExamples.find((e) => e.amount <= (finalAmount || 0))

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
      {/* Premium Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2670"
            alt="Helping hands"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/95 via-amber-500/90 to-amber-400/85" />
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="grain" />
        </div>

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white/20 rounded-full blur-[100px]"
        />

        <div className="relative container-wide z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                💝
              </motion.span>
              <span className="text-white font-medium">Support Our Mission</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Your Generosity
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block text-foundation-charcoal"
              >
                Transforms Lives
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/90 mb-8"
            >
              Every donation creates ripples of positive change in communities across Malaysia.
              Together, we can build a better future.
            </motion.p>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-flex gap-8 md:gap-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              {[
                { value: '2,500+', label: 'Donors' },
                { value: 'RM 15M', label: 'Raised' },
                { value: '50K+', label: 'Lives Changed' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-2xl lg:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="section-padding bg-white relative">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="relative container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= s
                          ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step > s ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>
                    {s < 3 && (
                      <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
                <div className="ml-4 text-sm text-gray-500">
                  {step === 1 && 'Choose Amount'}
                  {step === 2 && 'Your Information'}
                  {step === 3 && 'Confirm'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elegant p-8 lg:p-10"
              >
                {/* Step 1: Amount & Program */}
                {step === 1 && (
                  <div className="space-y-10">
                    {/* Donation Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Donation Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'one-time', label: 'One-Time', desc: 'Single contribution', icon: '💫' },
                          { id: 'monthly', label: 'Monthly', desc: 'Recurring impact', icon: '🔄' },
                        ].map((type) => (
                          <motion.button
                            key={type.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDonationType(type.id as 'one-time' | 'monthly')}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                              donationType === type.id
                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <div className="font-semibold text-foundation-charcoal mt-2">
                              {type.label}
                            </div>
                            <div className="text-sm text-gray-500">{type.desc}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Select Amount (MYR)
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {donationAmounts.map((amount) => (
                          <motion.button
                            key={amount}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAmountSelect(amount)}
                            className={`relative p-5 rounded-2xl border-2 font-bold text-lg transition-all ${
                              selectedAmount === amount
                                ? 'border-teal-500 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-glow-teal'
                                : 'border-gray-200 hover:border-teal-300 text-foundation-charcoal'
                            }`}
                          >
                            {formatCurrency(amount)}
                            {selectedAmount === amount && (
                              <motion.div
                                layoutId="selectedBadge"
                                className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                          RM
                        </span>
                        <input
                          type="number"
                          placeholder="Enter custom amount"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="input-elegant pl-14 text-lg font-semibold"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Program Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Choose a Program
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {programs.map((program) => (
                          <motion.button
                            key={program.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedProgram(program.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                              selectedProgram === program.id
                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                : 'border-gray-200 hover:border-teal-200'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${program.color} rounded-xl flex items-center justify-center text-xl`}>
                                {program.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-foundation-charcoal">
                                  {program.name}
                                </div>
                                <div className="text-sm text-gray-500">{program.description}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      disabled={!finalAmount}
                      className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Step 2: Donor Information */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                        Your Information
                      </h3>
                      <p className="text-gray-500 text-sm">
                        We'll send your tax receipt to this email
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={donorInfo.name}
                          onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                          className="input-elegant"
                          required
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={donorInfo.email}
                            onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                            className="input-elegant"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+60 12-345 6789"
                            value={donorInfo.phone}
                            onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                            className="input-elegant"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message (Optional)
                        </label>
                        <textarea
                          placeholder="Leave a message for the beneficiaries..."
                          value={donorInfo.message}
                          onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                          className="textarea-elegant"
                          rows={3}
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={donorInfo.anonymous}
                          onChange={(e) => setDonorInfo({ ...donorInfo, anonymous: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                        <div>
                          <span className="font-medium text-foundation-charcoal">Make this donation anonymous</span>
                          <p className="text-gray-500 text-sm">Your name won't be displayed publicly</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!donorInfo.name || !donorInfo.email}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Review Donation
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-4xl">💝</span>
                      </motion.div>
                      <h3 className="font-heading text-2xl font-semibold text-foundation-charcoal mb-2">
                        Review Your Donation
                      </h3>
                      <p className="text-gray-500">
                        Please confirm your donation details
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-display text-2xl font-bold text-teal-600">
                          {finalAmount ? formatCurrency(finalAmount) : 'RM 0'}
                          {donationType === 'monthly' && <span className="text-sm font-normal text-gray-500">/month</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Program</span>
                        <span className="font-medium">{programs.find((p) => p.id === selectedProgram)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium capitalize">{donationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donor</span>
                        <span className="font-medium">{donorInfo.anonymous ? 'Anonymous' : donorInfo.name}</span>
                      </div>
                    </div>

                    {currentImpact && (
                      <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{currentImpact.icon}</span>
                          <div>
                            <div className="font-semibold text-foundation-charcoal">Your Impact</div>
                            <p className="text-gray-600">{currentImpact.impact}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button className="btn-secondary flex-1 text-lg">
                        Complete Donation
                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-center text-gray-500 text-sm">
                      🔒 Secure payment powered by trusted partners
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elegant p-8 mb-8 sticky top-32"
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

                <div className="space-y-4 pt-6 border-t border-gray-100">
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
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foundation-charcoal text-lg">Total</span>
                      <span className="font-display text-2xl font-bold text-gradient">
                        {finalAmount ? formatCurrency(finalAmount) : 'RM 0'}
                        {donationType === 'monthly' && <span className="text-sm text-gray-500">/mo</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact Preview */}
                {currentImpact && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{currentImpact.icon}</span>
                      <div>
                        <div className="font-semibold text-foundation-charcoal text-sm">
                          Your Impact
                        </div>
                        <p className="text-gray-600 text-sm">
                          {currentImpact.impact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
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
                  { icon: '🔒', title: '100% Secure', desc: 'Bank-level encryption' },
                  { icon: '📜', title: 'Tax Deductible', desc: 'Official receipt provided' },
                  { icon: '✓', title: 'Registered', desc: 'SSM verified foundation' },
                  { icon: '📊', title: 'Transparent', desc: 'Annual reports available' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-foundation-charcoal text-sm">{item.title}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="section-padding bg-foundation-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge-premium mx-auto mb-6">
              <span className="accent-dot" />
              <span className="text-sm font-medium text-teal-700">More Options</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal mb-4">
              Other Ways to Support
            </h2>
            <p className="text-gray-600 text-lg">
              There are many ways to contribute to our mission
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏦',
                title: 'Bank Transfer',
                description: 'Direct transfer to our foundation account',
                details: ['Maybank: 5123-4567-8910', 'Account: Yayasan Insan Prihatin'],
                action: 'Get Bank Details',
              },
              {
                icon: '🤝',
                title: 'Corporate Giving',
                description: 'Partner with us for CSR initiatives',
                details: ['Customized partnership programs', 'Employee matching grants'],
                action: 'Become a Partner',
              },
              {
                icon: '📦',
                title: 'In-Kind Donations',
                description: 'Donate goods, equipment, or services',
                details: ['School supplies', 'Medical equipment', 'Professional services'],
                action: 'Learn More',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card-elegant p-8 text-center group"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <ul className="text-sm text-gray-500 space-y-1 mb-6">
                  {item.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
                <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors group-hover:underline">
                  {item.action} →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
