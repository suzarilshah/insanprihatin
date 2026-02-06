'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useRef } from 'react'
import { OrgChart } from '@/components/org-chart'
import { type LocalizedString, type Locale, getLocalizedValue } from '@/i18n/config'

// Types with LocalizedString support
type ReportType = 'direct' | 'dotted' | 'functional' | 'project'

type AdditionalManager = {
  id: string
  managerId: string
  reportType: ReportType
  notes: string | null
}

type TeamMember = {
  id: string
  name: string
  position: LocalizedString | string
  department: string | null
  bio: LocalizedString | string | null
  image: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  sortOrder: number | null
  parentId: string | null
  hierarchyLevel?: number | null
  isActive: boolean | null
  createdAt: Date
  updatedAt: Date
  microsoftId?: string | null
  microsoftSyncedAt?: Date | null
  additionalManagers?: AdditionalManager[]
}

type AboutData = {
  id: string
  title: LocalizedString | string
  content: LocalizedString | string
  mission: LocalizedString | string | null
  vision: LocalizedString | string | null
  values: unknown
  image: string | null
  updatedAt: Date
} | null

type ImpactStat = {
  id: string
  label: LocalizedString | string
  value: string
  suffix: LocalizedString | string | null
  icon: string | null
  sortOrder: number | null
  isActive: boolean | null
  updatedAt: Date
}

interface AboutContentProps {
  teamMembers: TeamMember[]
  aboutData: AboutData
  impactStats: ImpactStat[]
  locale?: Locale
}

const timeline = [
  {
    year: 'Q1 2025',
    title: 'The Foundation',
    description: 'Officially established Yayasan Insan Prihatin to address systemic community needs.',
    icon: '🌱',
  },
  {
    year: 'Q2 2025',
    title: 'First Initiative',
    description: 'Launched our pilot education support program for underprivileged students.',
    icon: '🎓',
  },
  {
    year: 'Q3 2025',
    title: 'Community Outreach',
    description: 'Expanded operations to include healthcare access in rural areas.',
    icon: '🏥',
  },
  {
    year: 'Q4 2025',
    title: 'Looking Ahead',
    description: 'Planning nationwide expansion of our digital literacy programs.',
    icon: '🚀',
  },
]

const defaultImpactStats = [
  { value: 'New', label: 'Organization', description: 'Fresh perspective on charity' },
  { value: '100%', label: 'Commitment', description: 'Dedicated to transparency' },
  { value: 'Growing', label: 'Community', description: 'Join our movement' },
  { value: '2025', label: 'Established', description: 'Beginning our journey' },
]

export default function AboutContent({ teamMembers, aboutData, impactStats, locale = 'en' }: AboutContentProps) {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  // Helper to get localized value
  const l = (value: LocalizedString | string | null | undefined): string => {
    return getLocalizedValue(value as LocalizedString, locale)
  }

  // Use database impact stats if available, otherwise fallback to defaults
  const displayImpactStats = impactStats.length > 0
    ? impactStats.map(stat => ({
        value: stat.value + l(stat.suffix),
        label: l(stat.label),
        description: l(stat.label),
      }))
    : defaultImpactStats

  // Use about data if available with localization
  const mission = l(aboutData?.mission) || (locale === 'ms'
    ? 'Memperkasa komuniti kurang bernasib baik melalui program mampan dalam pendidikan, penjagaan kesihatan, dan pembangunan ekonomi.'
    : 'To empower underprivileged communities through sustainable programs in education, healthcare, and economic development.')
  const vision = l(aboutData?.vision) || (locale === 'ms'
    ? 'Malaysia di mana setiap individu mempunyai peluang sama untuk berkembang maju dan hidup bermaruah.'
    : 'A Malaysia where every individual has equal opportunities to thrive, contribute to society, and live with dignity.')
  const values = (aboutData?.values as string[] | null) || ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation']

  return (
    <div>
      {/* Premium Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2670"
            alt="Team collaboration"
            fill
            className="object-cover"
            priority
            quality={95}
          />
        </motion.div>

        {/* Cinematic Gradient Overlay - Nav Safe */}
        <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal/95 via-foundation-charcoal/80 to-foundation-charcoal/40" />
        
        {/* Texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px]"
        />

        <motion.div style={{ opacity: heroOpacity }} className="relative container-wide py-32 z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90 tracking-widest uppercase">Who We Are</span>
            </motion.div>

            <h1 className="heading-display text-white mb-8 leading-[1.1]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Architects of
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 animate-gradient-x"
              >
                Sustainable Hope
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80 max-w-2xl border-l-2 border-amber-400/50 pl-6"
            >
              We are a newly established foundation with a bold vision. We are a movement of dedicated professionals, 
              partners, and volunteers committed to engineering long-term solutions 
              for Malaysia&apos;s most pressing social challenges.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Our Vision</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
          </motion.div>
        </motion.div>
      </section>

      {/* Impact Stats Section - Floating */}
      <section className="relative py-20 bg-foundation-pearl -mt-20 rounded-t-[3rem] z-20">
        <div className="container-wide">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayImpactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="font-display text-4xl lg:text-5xl font-bold text-teal-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                  {stat.label}
                </div>
                <p className="text-gray-500 text-sm">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision - Bento Grid Style */}
      <section className="section-padding bg-foundation-pearl relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-[100px]" />

        <div className="container-wide relative z-10">
          <div className="text-center mb-16">
            <h2 className="heading-section text-foundation-charcoal">
              Our <span className="text-teal-600 italic font-serif">Compass</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foundation-charcoal">Our Mission</h3>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  {mission}
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-foundation-charcoal text-white p-10 rounded-3xl shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-foundation-charcoal to-gray-900" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full translate-y-1/4 translate-x-1/4" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">Our Vision</h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {vision}
                </p>
              </div>
            </motion.div>

            {/* Values Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-white p-10 rounded-3xl shadow-lg border border-gray-100"
            >
              <h3 className="font-display text-2xl font-bold text-foundation-charcoal mb-8 text-center">Core Values</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {(Array.isArray(values) ? values : ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation']).map((value, i) => (
                  <motion.div
                    key={String(value)}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:bg-white hover:shadow-xl transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-lg font-bold">
                      {String(value).charAt(0)}
                    </div>
                    <span className="font-medium text-gray-700">{String(value)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline - Modern Vertical */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="container-wide relative">
          <div className="text-center mb-20">
            <h2 className="heading-section text-foundation-charcoal">
              Our <span className="text-teal-600 italic font-serif">Founding Roadmap</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal-200 via-teal-100 to-transparent -translate-x-1/2 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row gap-8 md:gap-0 items-center ${
                    index % 2 === 0 ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content Side */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 inline-block hover:border-teal-200 transition-colors group">
                      <div className="font-display text-3xl font-bold text-teal-600 mb-2 group-hover:text-amber-500 transition-colors">{item.year}</div>
                      <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm max-w-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Center Marker */}
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-4 border-teal-50 rounded-full shadow-md">
                    <span className="text-xl">{item.icon}</span>
                  </div>

                  {/* Empty Side for Balance */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section - Premium Org Chart */}
      <section id="leadership" className="section-padding bg-foundation-pearl relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mx-auto mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="text-sm font-medium text-teal-700 uppercase tracking-wide">The Stewards</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal mb-6">
              Leadership & Governance
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Guided by principles of integrity and excellence, our leadership ensures 
              every resource is maximized for community benefit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <OrgChart
              members={teamMembers.map(member => ({
                ...member,
                position: l(member.position),
                bio: l(member.bio),
              })) as Parameters<typeof OrgChart>[0]['members']}
              variant="department"
              showFilters={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Annual Reports - Dark Section */}
      <section id="reports" className="section-padding bg-foundation-charcoal relative overflow-hidden">
        {/* Premium background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-foundation-charcoal via-gray-900 to-foundation-charcoal" />
          <div className="absolute inset-0 bg-grid opacity-5" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80 uppercase tracking-wide">Radical Transparency</span>
              </div>

              <h2 className="heading-section text-white mb-6">
                Accountability in Action
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Trust is our most valuable currency. We commit to publishing annual audits 
                and impact reports to ensure every stakeholder knows exactly how their 
                contributions are transforming lives.
              </p>

              <div className="space-y-4">
                {/* Placeholder for future reports */}
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">2025 Annual Report</div>
                      <div className="text-gray-500 text-sm">Coming Early 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Decorative rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-white/5"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 rounded-full border border-teal-500/20"
                />

                {/* Central content */}
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)]">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="font-display text-6xl lg:text-7xl font-bold text-white mb-2"
                    >
                      100%
                    </motion.div>
                    <div className="text-xl text-white/90 font-medium">Transparency</div>
                    <div className="text-teal-300 text-sm mt-1">Audited Annually</div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full"
                >
                  <span className="text-white/80 text-sm font-medium">ISO Pending</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full"
                >
                  <span className="text-white/80 text-sm font-medium">SSM Registered</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2670"
            alt="Team collaboration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-sky-900/85" />
          <div className="absolute inset-0 bg-dots opacity-10" />
        </div>

        <div className="relative container-wide text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block text-6xl mb-6"
            >
              🤝
            </motion.span>

            <h2 className="heading-section text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Join us in our mission to create lasting positive change for communities across Malaysia.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/donate" className="btn-secondary shadow-lg hover:shadow-glow-amber">
                Donate Now
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="btn-outline border-white/40 text-white hover:bg-white hover:text-teal-900 hover:border-white"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
