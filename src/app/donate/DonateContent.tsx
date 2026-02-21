'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

// Types
interface Project {
  id: string
  slug: string
  title: { en: string; ms: string } | string
  description: { en: string; ms: string } | string
  featuredImage: string | null
  category: string | null
  donationEnabled: boolean
  donationGoal: number | null
  donationRaised: number
}

// Preset amounts optimized for conversion (research-backed)
const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500]

// Get localized string
function getLocalizedString(value: { en: string; ms: string } | string, locale: string): string {
  if (typeof value === 'string') return value
  return locale === 'ms' ? value.ms : value.en
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate funding progress percentage
function calculateProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0
  return Math.min((raised / goal) * 100, 100)
}

// Project Card Component
function ProjectCard({
  project,
  isSelected,
  onSelect,
  locale,
}: {
  project: Project | null // null = General Fund
  isSelected: boolean
  onSelect: () => void
  locale: string
}) {
  const t = useTranslations('donate')

  const isGeneralFund = !project
  const title = isGeneralFund
    ? t('generalFund.title')
    : getLocalizedString(project.title, locale)
  const description = isGeneralFund
    ? t('generalFund.description')
    : getLocalizedString(project.description, locale)

  const goal = project?.donationGoal ? project.donationGoal / 100 : 0
  const raised = project?.donationRaised ? project.donationRaised / 100 : 0
  const progress = calculateProgress(raised, goal)
  const remaining = Math.max(goal - raised, 0)

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-teal-500 ring-offset-2 shadow-lg shadow-teal-500/10'
          : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md'
      }`}
    >
      {/* Image/Gradient Header */}
      <div className="relative h-32 overflow-hidden">
        {project?.featuredImage ? (
          <Image
            src={project.featuredImage}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Category Badge */}
        {project?.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-full text-gray-700 capitalize">
            {project.category}
          </span>
        )}

        {/* Selected Check */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {/* Title on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2">
            {isGeneralFund ? '🌍 ' : ''}{title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>

        {/* Funding Progress (only for projects with goals) */}
        {goal > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">
                {formatCurrency(raised)} <span className="text-gray-500 font-normal">{t('of')} {formatCurrency(goal)}</span>
              </span>
              <span className="text-teal-600 font-semibold">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              />
            </div>
            {remaining > 0 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(remaining)} {t('remaining')}
              </p>
            )}
          </div>
        )}

        {/* General Fund indicator */}
        {isGeneralFund && (
          <div className="flex items-center gap-2 text-sm text-teal-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">{t('generalFund.flexible')}</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}

// Donor Form Step Component
function DonorForm({
  donor,
  setDonor,
  onSubmit,
  onBack,
  isSubmitting,
  error,
  displayAmount,
  selectedProject,
  locale,
}: {
  donor: { name: string; email: string; phone: string; isAnonymous: boolean }
  setDonor: (donor: { name: string; email: string; phone: string; isAnonymous: boolean }) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
  error: string | null
  displayAmount: number
  selectedProject: Project | null
  locale: string
}) {
  const t = useTranslations('donate')

  const projectTitle = selectedProject
    ? getLocalizedString(selectedProject.title, locale)
    : t('generalFund.title')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Summary Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
        <div>
          <p className="text-sm text-gray-600">{t('form.donatingTo')}</p>
          <p className="font-semibold text-gray-900">{projectTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{t('form.amount')}</p>
          <p className="text-2xl font-bold text-teal-600">{formatCurrency(displayAmount)}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3"
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Anonymous Toggle */}
      <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-teal-200 hover:bg-teal-50/30 cursor-pointer transition-all">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          donor.isAnonymous ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
        }`}>
          {donor.isAnonymous && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={donor.isAnonymous}
          onChange={(e) => setDonor({ ...donor, isAnonymous: e.target.checked })}
        />
        <div className="flex-1">
          <span className="font-medium text-gray-900">{t('form.anonymous')}</span>
          <p className="text-sm text-gray-500">{t('form.anonymousDescription')}</p>
        </div>
      </label>

      {/* Form Fields */}
      {!donor.isAnonymous && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.name')} *</label>
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              placeholder={t('form.namePlaceholder')}
              value={donor.name}
              onChange={(e) => setDonor({ ...donor, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.email')} *</label>
            <input
              type="email"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              placeholder={t('form.emailPlaceholder')}
              value={donor.email}
              onChange={(e) => setDonor({ ...donor, email: e.target.value })}
            />
            <p className="mt-1.5 text-xs text-gray-500">{t('form.emailNote')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.phone')}</label>
            <input
              type="tel"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              placeholder={t('form.phonePlaceholder')}
              value={donor.phone}
              onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
            />
          </div>
        </motion.div>
      )}

      {/* Email for anonymous (still needed for receipt) */}
      {donor.isAnonymous && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.email')} *</label>
          <input
            type="email"
            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
            placeholder={t('form.emailPlaceholder')}
            value={donor.email}
            onChange={(e) => setDonor({ ...donor, email: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-gray-500">{t('form.receiptEmail')}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || (!donor.isAnonymous && (!donor.name || !donor.email)) || (donor.isAnonymous && !donor.email)}
          className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('form.processing')}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{t('form.paySecurely')}</span>
            </>
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{t('trust.secure')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>FPX / {t('trust.cards')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{t('trust.receipt')}</span>
        </div>
      </div>
    </motion.div>
  )
}

// Main Donate Content Component
interface DonateContentProps {
  donationsClosed?: boolean
  closureReason?: { en: string; ms: string } | null
}

export default function DonateContent({
  donationsClosed = false,
  closureReason = null,
}: DonateContentProps) {
  const t = useTranslations('donate')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null) // null = General Fund
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [step, setStep] = useState<'select' | 'amount' | 'details'>('select')
  const [donor, setDonor] = useState({ name: '', email: '', phone: '', isAnonymous: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for pre-selected project from URL
  const preselectedProjectId = searchParams.get('project')
  const wasCancelled = searchParams.get('cancelled') === 'true'

  // Computed values
  const displayAmount = customAmount ? parseFloat(customAmount) || 0 : amount
  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  )

  // Fetch projects with donation enabled
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects?donationEnabled=true&published=true')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)

          // Pre-select project from URL if valid
          if (preselectedProjectId) {
            const exists = data.find((p: Project) => p.id === preselectedProjectId)
            if (exists) {
              setSelectedProjectId(preselectedProjectId)
              setStep('amount')
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [preselectedProjectId])

  // Handle amount selection
  const handleAmountSelect = (val: number) => {
    setAmount(val)
    setCustomAmount('')
    setError(null)
  }

  // Handle custom amount
  const handleCustomChange = (val: string) => {
    const numVal = val.replace(/[^0-9.]/g, '')
    setCustomAmount(numVal)
    if (numVal) setAmount(parseFloat(numVal) || 0)
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!displayAmount || displayAmount < 1) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!donor.isAnonymous && (!donor.name || !donor.email)) {
      setError(t('errors.missingInfo'))
      return
    }

    if (donor.isAnonymous && !donor.email) {
      setError(t('errors.emailRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: displayAmount,
          currency: 'MYR',
          projectId: selectedProjectId,
          program: selectedProject
            ? getLocalizedString(selectedProject.title, locale)
            : t('generalFund.title'),
          donorName: donor.isAnonymous ? 'Anonymous' : donor.name,
          donorEmail: donor.email,
          donorPhone: donor.phone || undefined,
          isAnonymous: donor.isAnonymous,
          donationType: 'one-time',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process donation')
      }

      // Redirect to payment gateway or success page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        router.push(`/donate/success?ref=${data.paymentReference}&amount=${displayAmount}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Progress indicator
  const progressSteps = [
    { key: 'select', label: t('steps.select') },
    { key: 'amount', label: t('steps.amount') },
    { key: 'details', label: t('steps.details') },
  ]
  const currentStepIndex = progressSteps.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Fixed, No Fading */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)' }} />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              <span className="text-sm font-medium text-teal-200 tracking-wide">{t('badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {t('heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                {t('heroTitleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              {t('heroDescription')}
            </motion.p>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-20 fill-gray-50" viewBox="0 0 1440 54" preserveAspectRatio="none">
            <path d="M0 22L60 16.7C120 11 240 1.00001 360 0.700012C480 0.700012 600 11 720 16.7C840 22 960 22 1080 20.2C1200 18 1320 14 1380 12.2L1440 10V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative -mt-4 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {donationsClosed ? (
              /* ========== DONATION CLOSED STATE ========== */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
              >
                <div className="p-8 md:p-12 text-center">
                  {/* Status Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-8"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span className="text-sm font-medium text-amber-700">{t('closed.badge')}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
                  >
                    {t('closed.title')}
                  </motion.h2>

                  {/* Reason or default description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed"
                  >
                    {closureReason
                      ? (locale === 'ms' ? closureReason.ms || closureReason.en : closureReason.en)
                      : t('closed.description')
                    }
                  </motion.p>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full mx-auto mb-8" />

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                  >
                    <Link
                      href={`/${locale}/contact`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('closed.contactUs')}
                    </Link>
                    <Link
                      href={`/${locale}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t('closed.returnHome')}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
            /* ========== NORMAL DONATION FORM ========== */
            <>
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {progressSteps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    i <= currentStepIndex
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-teal-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Cancelled Payment Warning */}
            {wasCancelled && step === 'select' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
              >
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">{t('paymentCancelled.title')}</p>
                  <p className="text-sm text-amber-700">{t('paymentCancelled.description')}</p>
                </div>
              </motion.div>
            )}

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
              <AnimatePresence mode="wait">

                {/* STEP 1: Select Project */}
                {step === 'select' && (
                  <motion.div
                    key="step-select"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 md:p-10"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {t('selectProject.title')}
                      </h2>
                      <p className="text-gray-600">{t('selectProject.description')}</p>
                    </div>

                    {loadingProjects ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4 mb-8">
                        {/* General Fund - Always First */}
                        <ProjectCard
                          project={null}
                          isSelected={selectedProjectId === null}
                          onSelect={() => setSelectedProjectId(null)}
                          locale={locale}
                        />

                        {/* Projects with Donation Enabled */}
                        {projects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            isSelected={selectedProjectId === project.id}
                            onSelect={() => setSelectedProjectId(project.id)}
                            locale={locale}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setStep('amount')}
                      className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold text-lg hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg"
                    >
                      {t('continue')}
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: Choose Amount */}
                {step === 'amount' && (
                  <motion.div
                    key="step-amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 md:p-10"
                  >
                    {/* Selected Project Summary */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-8">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        {selectedProject?.featuredImage ? (
                          <Image
                            src={selectedProject.featuredImage}
                            alt=""
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🌍</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500">{t('donatingTo')}</p>
                        <p className="font-semibold text-gray-900 truncate">
                          {selectedProject
                            ? getLocalizedString(selectedProject.title, locale)
                            : t('generalFund.title')}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep('select')}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {t('change')}
                      </button>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center py-8">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-4">
                        {t('amount.enter')}
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl text-gray-400 font-light">RM</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={customAmount || amount}
                          onChange={(e) => handleCustomChange(e.target.value)}
                          className="text-6xl md:text-7xl font-bold text-center bg-transparent border-none focus:ring-0 w-full max-w-xs outline-none text-gray-900"
                          placeholder="0"
                        />
                      </div>
                      {displayAmount >= 1 && (
                        <p className="mt-3 text-sm text-gray-500">
                          {displayAmount >= 2500 ? '💎 ' : displayAmount >= 1000 ? '⭐ ' : displayAmount >= 500 ? '🌟 ' : ''}
                          {t('amount.thankYou')}
                        </p>
                      )}
                    </div>

                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {PRESET_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          onClick={() => handleAmountSelect(val)}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            amount === val && !customAmount
                              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          RM {val.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Impact Messaging */}
                    {displayAmount >= 10 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 mb-8"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-900 mb-1">{t('impact.title')}</p>
                            <p className="text-sm text-amber-800">
                              {displayAmount >= 2500
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'biasiswa penuh untuk seorang pelajar' : 'a full scholarship for one student' })
                                : displayAmount >= 1000
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'bekalan makanan untuk 50 keluarga' : 'food supplies for 50 families' })
                                : displayAmount >= 500
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'peralatan sekolah untuk 25 pelajar' : 'school supplies for 25 students' })
                                : displayAmount >= 250
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'bekalan perubatan untuk sebulan' : 'medical supplies for one month' })
                                : displayAmount >= 100
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'makanan untuk 10 keluarga' : 'meals for 10 families' })
                                : displayAmount >= 50
                                ? t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'buku untuk 5 pelajar' : 'books for 5 students' })
                                : t('impact.yourInvestment', { amount: displayAmount.toLocaleString(), description: locale === 'ms' ? 'bantuan untuk komuniti' : 'community support' })
                              }
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Project Funding Progress (if applicable) */}
                    {selectedProject && selectedProject.donationGoal && selectedProject.donationGoal > 0 && (
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100 mb-8">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">{t('fundingProgress')}</span>
                          <span className="font-semibold text-teal-700">
                            {calculateProgress(selectedProject.donationRaised / 100, selectedProject.donationGoal / 100).toFixed(0)}% {t('funded')}
                          </span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateProgress(selectedProject.donationRaised / 100, selectedProject.donationGoal / 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{formatCurrency(selectedProject.donationRaised / 100)} {t('raised')}</span>
                          <span>{t('goalOf')} {formatCurrency(selectedProject.donationGoal / 100)}</span>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('select')}
                        className="px-6 py-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {t('back')}
                      </button>
                      <button
                        onClick={() => {
                          if (displayAmount < 1) {
                            setError(t('errors.minimumAmount'))
                            return
                          }
                          setError(null)
                          setStep('details')
                        }}
                        disabled={displayAmount < 1}
                        className="flex-1 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold text-lg hover:from-gray-800 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {t('continueToDetails')}
                      </button>
                    </div>

                    {error && (
                      <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Donor Details */}
                {step === 'details' && (
                  <motion.div
                    key="step-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 md:p-10"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      {t('form.title')}
                    </h2>

                    <DonorForm
                      donor={donor}
                      setDonor={setDonor}
                      onSubmit={handleSubmit}
                      onBack={() => setStep('amount')}
                      isSubmitting={isSubmitting}
                      error={error}
                      displayAmount={displayAmount}
                      selectedProject={selectedProject}
                      locale={locale}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
            </>
            )}

            {/* Trust Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 grid md:grid-cols-3 gap-6"
            >
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('trust.secureTitle')}</h3>
                <p className="text-sm text-gray-600">{t('trust.secureDescription')}</p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('trust.transparentTitle')}</h3>
                <p className="text-sm text-gray-600">{t('trust.transparentDescription')}</p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('trust.taxTitle')}</h3>
                <p className="text-sm text-gray-600">{t('trust.taxDescription')}</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  )
}
