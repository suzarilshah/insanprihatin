'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

// Types
interface Project {
  id: string
  title: string
  slug: string
  description: string
  featuredImage?: string
  donationGoal?: number
  donationRaised?: number
}

// Configuration
const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500]

const PROGRAMS = [
  { id: 'general', name: 'General Fund', description: 'Maximum flexibility where needed most', icon: '🌍', color: 'from-teal-400 to-teal-500' },
  { id: 'education', name: 'Education', description: 'Scholarships & digital literacy', icon: '🎓', color: 'from-blue-400 to-blue-500' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical camps & screenings', icon: '🩺', color: 'from-rose-400 to-rose-500' },
  { id: 'community', name: 'Community', description: 'Skills training & development', icon: '🤝', color: 'from-amber-400 to-amber-500' },
]

const IMPACT_TIERS = [
  { threshold: 50, label: 'School Supplies', desc: 'Equips 1 student for a term', emoji: '📚' },
  { threshold: 100, label: 'Medical Checkup', desc: 'Screening for 5 villagers', emoji: '🩺' },
  { threshold: 250, label: 'Skills Training', desc: '1 month vocational course', emoji: '🛠️' },
  { threshold: 500, label: 'Reforestation', desc: 'Plants 50 native trees', emoji: '🌱' },
  { threshold: 1000, label: 'Scholarship', desc: 'Full semester support', emoji: '🎓' },
  { threshold: 2500, label: 'Classroom Tech', desc: 'Smart equipment for rural school', emoji: '💻' },
]

export default function DonateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [program, setProgram] = useState(PROGRAMS[0].id)
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time')
  const [step, setStep] = useState<'project' | 'amount' | 'details' | 'confirm'>('project')

  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  // Donor Info
  const [donor, setDonor] = useState({ name: '', email: '', phone: '', message: '', isAnonymous: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for cancelled/failed payment
  const wasCancelled = searchParams.get('cancelled') === 'true'
  const preSelectedProject = searchParams.get('project')

  // Load projects with donation enabled
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch('/api/projects?donationEnabled=true&published=true')
        if (response.ok) {
          const data = await response.json()
          setProjects(data || [])

          // Pre-select project if provided in URL
          if (preSelectedProject && data?.find((p: Project) => p.id === preSelectedProject)) {
            setSelectedProject(preSelectedProject)
            setStep('amount')
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err)
      } finally {
        setIsLoadingProjects(false)
      }
    }
    loadProjects()
  }, [preSelectedProject])

  // Computed
  const currentImpact = IMPACT_TIERS.slice().reverse().find(t => amount >= t.threshold) || IMPACT_TIERS[0]
  const displayAmount = customAmount ? parseFloat(customAmount) : amount
  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null

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

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProject(projectId)
    setStep('amount')
  }

  const getProgress = (project: Project) => {
    if (!project.donationGoal || project.donationGoal === 0) return 0
    return Math.min((project.donationRaised || 0) / project.donationGoal * 100, 100)
  }

  const handleSubmit = async () => {
    if (!displayAmount || displayAmount < 1) {
      setError('Please enter a valid donation amount')
      return
    }

    if (!donor.isAnonymous && (!donor.name || !donor.email)) {
      setError('Please provide your name and email')
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
          projectId: selectedProject,
          program: selectedProject
            ? selectedProjectData?.title
            : PROGRAMS.find(p => p.id === program)?.name || 'General Fund',
          donorName: donor.isAnonymous ? 'Anonymous' : donor.name,
          donorEmail: donor.email,
          donorPhone: donor.phone,
          message: donor.message,
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
      <div className="absolute inset-0 z-0 h-[85vh] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2670"
          alt="Helping hands"
          fill
          className="object-cover"
          priority
        />
        {/* Cinematic Overlay - ensuring nav visibility and text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal/80 via-foundation-charcoal/60 to-foundation-pearl" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="relative z-10 container-wide pt-40 pb-20">

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
            <span className="text-sm font-medium text-amber-100 tracking-wide uppercase">2025 Impact Fund Open</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-display text-6xl md:text-8xl mb-8 text-white tracking-tight"
          >
            Invest in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300 animate-gradient-x">Sustainable</span> Futures.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto font-light"
          >
            Join a community of visionaries. 100% of your donation goes directly to verified programs.
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
                  initial={{ width: '25%' }}
                  animate={{
                    width: step === 'project' ? '25%'
                      : step === 'amount' ? '50%'
                      : step === 'details' ? '75%'
                      : '100%'
                  }}
                />
              </div>

              <div className="p-8 md:p-10">
                <AnimatePresence mode="wait">

                  {/* STEP 0: PROJECT SELECTION */}
                  {step === 'project' && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="font-heading text-2xl font-bold text-foundation-charcoal">Where would you like to donate?</h3>
                        <p className="text-gray-500 mt-2">Choose a specific project or contribute to our general fund</p>
                      </div>

                      {/* General Fund Option */}
                      <button
                        onClick={() => handleProjectSelect(null)}
                        className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center text-2xl">
                            🌍
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foundation-charcoal group-hover:text-teal-700">General Fund</h4>
                            <p className="text-sm text-gray-500">Maximum flexibility - allocated where needed most</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      {/* Projects with Donation Enabled */}
                      {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                        </div>
                      ) : projects.length > 0 ? (
                        <>
                          <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-gray-400 text-sm">or support a specific project</span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>

                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {projects.map((project) => (
                              <button
                                key={project.id}
                                onClick={() => handleProjectSelect(project.id)}
                                className="w-full p-4 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-left group"
                              >
                                <div className="flex items-start gap-4">
                                  {project.featuredImage ? (
                                    <img
                                      src={project.featuredImage}
                                      alt={project.title}
                                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-teal-700 truncate">{project.title}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{project.description}</p>
                                    {project.donationGoal && (
                                      <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>RM {((project.donationRaised || 0) / 100).toLocaleString()}</span>
                                          <span>Goal: RM {(project.donationGoal / 100).toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-teal-500 transition-all"
                                            style={{ width: `${getProgress(project)}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </motion.div>
                  )}

                  {/* STEP 1: AMOUNT */}
                  {step === 'amount' && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {/* Back to project selection */}
                      <button
                        onClick={() => setStep('project')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Change destination
                      </button>

                      {/* Selected destination */}
                      <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white text-lg">
                            {selectedProjectData ? '📋' : '🌍'}
                          </div>
                          <div>
                            <div className="text-xs text-teal-600 font-medium uppercase tracking-wider">Donating to</div>
                            <div className="font-semibold text-teal-800">{selectedProjectData?.title || 'General Fund'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Frequency Toggle */}
                      <div className="flex p-1 bg-gray-100/80 rounded-xl w-max mx-auto">
                        {['one-time', 'monthly'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFrequency(f as 'one-time' | 'monthly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              frequency === f
                                ? 'bg-white text-teal-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {f === 'one-time' ? 'One-Time' : 'Monthly'}
                          </button>
                        ))}
                      </div>

                      {/* Main Amount Display */}
                      <div className="text-center py-6">
                        <div className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-xs">Enter Amount</div>
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

                      {/* Program Selector (only show for General Fund) */}
                      {!selectedProject && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Allocated Fund</label>
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
                      )}

                      <button
                        onClick={() => setStep('details')}
                        className="w-full py-4 bg-foundation-charcoal text-white rounded-xl font-bold text-lg hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-gray-200"
                      >
                        Continue
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
                        <h3 className="font-heading text-2xl font-bold">Your Details</h3>
                        <button onClick={() => setStep('amount')} className="text-sm text-gray-500 hover:text-teal-600">Edit Amount</button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                            placeholder="Jane Doe"
                            value={donor.name}
                            onChange={e => setDonor({...donor, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                            placeholder="jane@example.com"
                            value={donor.email}
                            onChange={e => setDonor({...donor, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Phone (Optional)</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all"
                          placeholder="+60 12 345 6789"
                          value={donor.phone}
                          onChange={e => setDonor({...donor, phone: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message (Optional)</label>
                        <textarea
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-0 transition-all resize-none"
                          placeholder="Share a message of support..."
                          rows={3}
                          value={donor.message}
                          onChange={e => setDonor({...donor, message: e.target.value})}
                        />
                      </div>

                      <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${donor.isAnonymous ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                          {donor.isAnonymous && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={donor.isAnonymous} onChange={e => setDonor({...donor, isAnonymous: e.target.checked})} />
                        <div>
                          <div className="font-medium text-gray-900">Make this donation anonymous</div>
                          <div className="text-xs text-gray-500">Your name won&apos;t appear on public lists</div>
                        </div>
                      </label>

                      <button
                        onClick={() => setStep('confirm')}
                        disabled={!donor.isAnonymous && (!donor.name || !donor.email)}
                        className="w-full py-4 bg-foundation-charcoal text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Review Donation
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
                        <h3 className="font-heading text-2xl font-bold">Secure Checkout</h3>
                      </div>

                      {/* Error Message */}
                      {(error || wasCancelled) && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                          {error || 'Payment was cancelled. You can try again.'}
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-bold text-xl text-gray-900">RM {displayAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Frequency</span>
                          <span className="font-medium capitalize">{frequency}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Destination</span>
                          <span className="font-medium">
                            {selectedProjectData?.title || PROGRAMS.find(p => p.id === program)?.name}
                          </span>
                        </div>
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Name</span>
                          <span className="font-medium">{donor.isAnonymous ? 'Anonymous' : donor.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Email</span>
                          <span className="font-medium">{donor.email}</span>
                        </div>
                      </div>

                      {/* Security Badge */}
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm text-emerald-700">
                          Your payment is secured by ToyyibPay. We never store your card details.
                        </span>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>Pay RM {displayAmount} Securely</>
                        )}
                      </button>

                      <button onClick={() => setStep('details')} className="w-full text-sm text-gray-400 hover:text-gray-600">
                        Back to details
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
                <div className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">Projected Impact</div>
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{currentImpact.emoji}</div>
                <h3 className="font-heading text-3xl font-bold mb-3">{currentImpact.label}</h3>
                <p className="text-amber-50 text-xl leading-relaxed font-light">
                  Your <span className="font-bold text-white">RM {displayAmount}</span> investment helps provide {currentImpact.desc.toLowerCase()}.
                </p>

                {/* Progress Visual */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs font-medium text-amber-100 mb-2">
                    <span>Impact Scale</span>
                    <span>High Impact</span>
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
              <h4 className="font-heading text-lg font-bold text-gray-900 mb-6">Where Your Money Goes</h4>
              <div className="space-y-4">
                {[
                  { label: 'Direct Aid & Programs', val: '85%', color: 'bg-teal-500' },
                  { label: 'Operations & Staff', val: '10%', color: 'bg-blue-500' },
                  { label: 'Fundraising', val: '5%', color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.val }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100/50">
                *Audited annually. Transparency Report available upon request.
              </p>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg">
                <span className="text-2xl">🔒</span>
                <div className="text-xs font-medium text-gray-600">256-bit SSL<br/>Encryption</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg">
                <span className="text-2xl">🛡️</span>
                <div className="text-xs font-medium text-gray-600">Official Tax<br/>Receipt</div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
