'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

// Configuration
const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500]

const IMPACT_TIERS = [
  { threshold: 50, labelKey: 'schoolSupplies', descKey: 'equipsStudent', emoji: '📚' },
  { threshold: 100, labelKey: 'medicalCheckup', descKey: 'screeningVillagers', emoji: '🩺' },
  { threshold: 250, labelKey: 'skillsTraining', descKey: 'vocationalCourse', emoji: '🛠️' },
  { threshold: 500, labelKey: 'reforestation', descKey: 'plantsTrees', emoji: '🌱' },
  { threshold: 1000, labelKey: 'scholarship', descKey: 'semesterSupport', emoji: '🎓' },
  { threshold: 2500, labelKey: 'classroomTech', descKey: 'smartEquipment', emoji: '💻' },
]

export default function DonateContent() {
  const t = useTranslations('donate')

  // Programs with translations
  const PROGRAMS = [
    { id: 'general', name: t('programs.general.name'), description: t('programs.general.description'), icon: '🌍', color: 'from-teal-400 to-teal-500' },
    { id: 'education', name: t('programs.education.name'), description: t('programs.education.description'), icon: '🎓', color: 'from-blue-400 to-blue-500' },
    { id: 'healthcare', name: t('programs.healthcare.name'), description: t('programs.healthcare.description'), icon: '🩺', color: 'from-rose-400 to-rose-500' },
    { id: 'community', name: t('programs.community.name'), description: t('programs.community.description'), icon: '🤝', color: 'from-amber-400 to-amber-500' },
  ]
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  // State
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [program, setProgram] = useState(PROGRAMS[0].id)
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time')
  const [step, setStep] = useState<'amount' | 'details' | 'confirm'>('amount')
  
  // Donor Info
  const [donor, setDonor] = useState({ name: '', email: '', phone: '', isAnonymous: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for cancelled payment
  const wasCancelled = searchParams.get('cancelled') === 'true'

  // Computed
  const currentImpact = IMPACT_TIERS.slice().reverse().find(t => amount >= t.threshold) || IMPACT_TIERS[0]
  const displayAmount = customAmount ? parseFloat(customAmount) : amount

  // Handlers
  const handleAmountSelect = (val: number) => {
    setAmount(val)
    setCustomAmount('')
    setError(null)
  }

  const handleCustomChange = (val: string) => {
    setCustomAmount(val)
    if (val) setAmount(parseFloat(val))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!displayAmount || displayAmount < 1) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!donor.isAnonymous && (!donor.name || !donor.email)) {
      setError(t('errors.missingInfo'))
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
          amount: displayAmount,
          currency: 'MYR',
          program: PROGRAMS.find(p => p.id === program)?.name || 'General Fund',
          donorName: donor.isAnonymous ? 'Anonymous' : donor.name,
          donorEmail: donor.email,
          isAnonymous: donor.isAnonymous,
          donationType: frequency,
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
          router.push(`/donate/success?ref=${data.paymentReference}&method=manual&amount=${displayAmount}`)
        }
      } else {
        // Fallback to success page
        router.push(`/donate/success?ref=${data.paymentReference}&amount=${displayAmount}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-foundation-pearl selection:bg-teal-100 selection:text-teal-900">
      
      {/* Hero Background - Full Image with Premium Overlay */}
      <section ref={heroRef} className="absolute inset-0 z-0 h-[85vh] w-full overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2670"
            alt="Helping hands"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Cinematic Overlay - ensuring nav visibility and text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal/80 via-foundation-charcoal/60 to-foundation-pearl" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
      </section>

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container-wide pt-40 pb-20">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-sm font-medium text-amber-100 tracking-wide uppercase">{t('badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-display text-6xl md:text-8xl mb-8 text-white tracking-tight"
          >
            {t('heroTitle')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300 animate-gradient-x">{t('heroTitleHighlight')}</span> {t('heroTitleEnd')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto font-light"
          >
            {t('heroDescription')}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* LEFT: Donation Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 border border-white/50 overflow-hidden relative backdrop-blur-xl">
              
              {/* Progress Bar */}
              <div className="h-1 bg-gray-100 w-full">
                <motion.div 
                  className="h-full bg-teal-500"
                  initial={{ width: '33%' }}
                  animate={{ width: step === 'amount' ? '33%' : step === 'details' ? '66%' : '100%' }}
                />
              </div>

              <div className="p-8 md:p-10">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: AMOUNT */}
                  {step === 'amount' && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {/* Frequency Toggle */}
                      <div className="flex p-1 bg-gray-100/80 rounded-xl w-max mx-auto">
                        {['one-time', 'monthly'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFrequency(f as any)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              frequency === f
                                ? 'bg-white text-teal-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {f === 'one-time' ? t('frequency.oneTime') : t('frequency.monthly')}
                          </button>
                        ))}
                      </div>

                      {/* Main Amount Display */}
                      <div className="text-center py-6">
                        <div className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-xs">{t('amount.label')}</div>
                        <div className="flex items-baseline justify-center gap-2 font-display text-foundation-charcoal">
                          <span className="text-4xl text-gray-300 font-light">RM</span>
                          <input 
                            type="number" 
                            value={customAmount || amount}
                            onChange={(e) => handleCustomChange(e.target.value)}
                            className="text-7xl font-bold w-full max-w-[300px] text-center bg-transparent border-none focus:ring-0 p-0 placeholder-gray-200"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="grid grid-cols-3 gap-3">
                        {PRESET_AMOUNTS.map((val) => (
                          <button
                            key={val}
                            onClick={() => handleAmountSelect(val)}
                            className={`py-3 rounded-xl font-medium transition-all ${
                              amount === val && !customAmount
                                ? 'bg-teal-50 text-teal-700 ring-2 ring-teal-500 ring-offset-2'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            RM {val}
                          </button>
                        ))}
                      </div>

                      {/* Program Selector */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t('allocatedFund')}</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {PROGRAMS.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setProgram(p.id)}
                              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                                program === p.id
                                  ? 'border-teal-500 bg-teal-50/50'
                                  : 'border-gray-200 hover:border-teal-200'
                              }`}
                            >
                              <span className="text-2xl">{p.icon}</span>
                              <div>
                                <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                                <div className="text-xs text-gray-500">{p.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setStep('details')}
                        className="w-full py-4 bg-foundation-charcoal text-white rounded-xl font-bold text-lg hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-gray-200"
                      >
                        {t('continue')}
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 'details' && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-2xl font-bold">{t('form.title')}</h3>
                        <button onClick={() => setStep('amount')} className="text-sm text-gray-500 hover:text-teal-600">{t('form.editAmount')}</button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">{t('form.name')}</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                            placeholder={t('form.namePlaceholder')}
                            value={donor.name}
                            onChange={e => setDonor({...donor, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">{t('form.email')}</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                            placeholder={t('form.emailPlaceholder')}
                            value={donor.email}
                            onChange={e => setDonor({...donor, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('form.phone')}</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                          placeholder={t('form.phonePlaceholder')}
                          value={donor.phone}
                          onChange={e => setDonor({...donor, phone: e.target.value})}
                        />
                      </div>

                      <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${donor.isAnonymous ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                          {donor.isAnonymous && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={donor.isAnonymous} onChange={e => setDonor({...donor, isAnonymous: e.target.checked})} />
                        <div>
                          <div className="font-medium text-gray-900">{t('form.anonymous')}</div>
                          <div className="text-xs text-gray-500">{t('form.anonymousDescription')}</div>
                        </div>
                      </label>

                      <button
                        onClick={() => setStep('confirm')}
                        disabled={!donor.name || !donor.email}
                        className="w-full py-4 bg-foundation-charcoal text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('form.reviewDonation')}
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 3: CONFIRM */}
                  {step === 'confirm' && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                          🔒
                        </div>
                        <h3 className="font-heading text-2xl font-bold">{t('confirm.title')}</h3>
                      </div>

                      {/* Error Message */}
                      {(error || wasCancelled) && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                          {error || t('confirm.paymentCancelled')}
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('confirm.amount')}</span>
                          <span className="font-bold text-xl text-gray-900">RM {displayAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('confirm.frequency')}</span>
                          <span className="font-medium capitalize">{frequency === 'one-time' ? t('frequency.oneTime') : t('frequency.monthly')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('confirm.program')}</span>
                          <span className="font-medium">{PROGRAMS.find(p => p.id === program)?.name}</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('confirm.name')}</span>
                          <span className="font-medium">{donor.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('confirm.email')}</span>
                          <span className="font-medium">{donor.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">{t('confirm.processing')}</span>
                        ) : (
                          <>{t('confirm.paySecurely').replace('{amount}', String(displayAmount))}</>
                        )}
                      </button>

                      <button onClick={() => setStep('details')} className="w-full text-sm text-gray-400 hover:text-gray-600">
                        {t('confirm.backToDetails')}
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Impact Visualization & Trust */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Dynamic Impact Card */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-1 shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
              <div className="relative bg-white/10 backdrop-blur-md rounded-[1.8rem] p-8 h-full border border-white/20">
                <div className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">{t('impact.title')}</div>
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{currentImpact.emoji}</div>
                <h3 className="font-heading text-3xl font-bold mb-3">{currentImpact.labelKey}</h3>
                <p className="text-amber-50 text-xl leading-relaxed font-light">
                  {t('impact.yourInvestment').replace('{amount}', String(displayAmount)).replace('{description}', currentImpact.descKey.toLowerCase())}
                </p>

                {/* Progress Visual */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs font-medium text-amber-100 mb-2">
                    <span>{t('impact.scaleLabel')}</span>
                    <span>{t('impact.highImpact')}</span>
                  </div>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((displayAmount / 2500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transparency Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-8 border border-white shadow-xl">
              <h4 className="font-heading text-lg font-bold text-gray-900 mb-6">{t('transparency.title')}</h4>
              <div className="space-y-4">
                {[
                  { labelKey: 'transparency.directAid', val: '85%', color: 'bg-teal-500' },
                  { labelKey: 'transparency.operations', val: '10%', color: 'bg-blue-500' },
                  { labelKey: 'transparency.fundraising', val: '5%', color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.labelKey}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{t(item.labelKey)}</span>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.val }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100/50">
                {t('transparency.auditNote')}
              </p>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg">
                <span className="text-2xl">🔒</span>
                <div className="text-xs font-medium text-gray-600">{t('security.ssl')}<br/>{t('security.encryption')}</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg">
                <span className="text-2xl">🛡️</span>
                <div className="text-xs font-medium text-gray-600">{t('security.taxReceipt')}<br/>{t('security.receipt')}</div>
              </div>
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
