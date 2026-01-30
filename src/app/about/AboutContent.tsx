'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { OrgChart } from '@/components/org-chart'

type TeamMember = {
  id: string
  name: string
  position: string
  department: string | null
  bio: string | null
  image: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  sortOrder: number | null
  parentId: string | null
  isActive: boolean | null
  createdAt: Date
  updatedAt: Date
}

type AboutData = {
  id: string
  title: string
  content: string
  mission: string | null
  vision: string | null
  values: unknown
  image: string | null
  updatedAt: Date
} | null

type ImpactStat = {
  id: string
  label: string
  value: string
  suffix: string | null
  icon: string | null
  sortOrder: number | null
  isActive: boolean | null
  updatedAt: Date
}

interface AboutContentProps {
  teamMembers: TeamMember[]
  aboutData: AboutData
  impactStats: ImpactStat[]
}

const timeline = [
  {
    year: '2010',
    title: 'Foundation Established',
    description: 'Yayasan Insan Prihatin was founded with a mission to serve underprivileged communities.',
    icon: '🌱',
  },
  {
    year: '2013',
    title: 'First Major Project',
    description: 'Launched our first nationwide scholarship program, supporting 100 students.',
    icon: '🎓',
  },
  {
    year: '2016',
    title: 'Healthcare Initiative',
    description: 'Introduced mobile medical camps to reach rural communities without healthcare access.',
    icon: '🏥',
  },
  {
    year: '2019',
    title: 'Environmental Focus',
    description: 'Started the Green Malaysia Initiative with a goal of planting 100,000 trees.',
    icon: '🌳',
  },
  {
    year: '2022',
    title: 'Community Centers',
    description: 'Opened skill training centers in multiple states to empower local communities.',
    icon: '🏢',
  },
  {
    year: '2025',
    title: 'Major Milestone',
    description: 'Reached RM 15 million in total impact and 50,000 lives transformed.',
    icon: '🏆',
  },
]

const defaultDepartments = [
  { name: 'Board of Trustees', color: 'from-amber-500 to-amber-600' },
  { name: 'Executive Leadership', color: 'from-teal-500 to-teal-600' },
  { name: 'Program Management', color: 'from-sky-500 to-sky-600' },
  { name: 'Finance & Administration', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Communications & PR', color: 'from-purple-500 to-purple-600' },
  { name: 'Strategic Partnerships', color: 'from-rose-500 to-rose-600' },
]

const defaultImpactStats = [
  { value: '50K+', label: 'Lives Impacted', description: 'Individuals directly benefited from our programs' },
  { value: 'RM 15M', label: 'Funds Channeled', description: 'Transparently managed for maximum impact' },
  { value: '13', label: 'States Covered', description: 'Reaching communities across Malaysia' },
  { value: '98%', label: 'Fund Utilization', description: 'Directly supporting our programs' },
]

const departmentColors = [
  'from-amber-500 to-amber-600',
  'from-teal-500 to-teal-600',
  'from-sky-500 to-sky-600',
  'from-emerald-500 to-emerald-600',
  'from-purple-500 to-purple-600',
  'from-rose-500 to-rose-600',
  'from-blue-500 to-blue-600',
  'from-pink-500 to-pink-600',
]

export default function AboutContent({ teamMembers, aboutData, impactStats }: AboutContentProps) {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  // Get unique departments from team members
  const uniqueDepartments = [...new Set(teamMembers.map(m => m.department).filter(Boolean))]
  const departments = uniqueDepartments.map((dept, i) => ({
    name: dept!,
    color: departmentColors[i % departmentColors.length]
  }))

  // Use database impact stats if available, otherwise fallback to defaults
  const displayImpactStats = impactStats.length > 0
    ? impactStats.map(stat => ({
        value: stat.value + (stat.suffix || ''),
        label: stat.label,
        description: `${stat.label}`,
      }))
    : defaultImpactStats

  // Use about data if available
  const mission = aboutData?.mission || 'To empower underprivileged communities through sustainable programs in education, healthcare, and economic development, creating lasting positive change across Malaysia.'
  const vision = aboutData?.vision || 'A Malaysia where every individual has equal opportunities to thrive, contribute to society, and live with dignity regardless of their background or circumstances.'
  const values = (aboutData?.values as string[] | null) || ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation']

  return (
    <div>
      {/* Premium Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670"
            alt="Team collaboration"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>

        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-sky-900/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="grain" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[100px]"
        />

        <motion.div style={{ opacity: heroOpacity }} className="relative container-wide py-32 z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="badge-premium bg-white/10 text-white/90 mb-8"
            >
              <span className="accent-dot" />
              <span className="text-sm font-medium tracking-wide">Our Story</span>
            </motion.div>

            <h1 className="heading-display text-white mb-8">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                A Journey of
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gradient-amber"
              >
                Compassion
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80 max-w-2xl"
            >
              For over a decade, Yayasan Insan Prihatin has been at the forefront of
              community service, creating sustainable impact through education, healthcare,
              and development programs across Malaysia.
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
            <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-1 bg-white/60 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Impact Stats Section */}
      <section className="relative py-20 bg-white -mt-20 rounded-t-[3rem] z-20">
        <div className="container-wide">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayImpactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elegant p-8 text-center group"
              >
                <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-2">
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

      {/* Mission & Vision - Premium */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Premium image composition */}
              <div className="relative">
                {/* Background decorative shape */}
                <div className="absolute -inset-4 bg-gradient-to-br from-teal-100 to-teal-50 rounded-[2.5rem] -rotate-3" />

                {/* Main image */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-dramatic">
                  <Image
                    src={aboutData?.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2574"}
                    alt="Community gathering"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent" />
                </div>

                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-8 -right-8 card-glass p-6 shadow-elevated"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-foundation-charcoal">14+</div>
                      <div className="text-gray-500 text-sm">Years of Service</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="badge-premium mb-6">
                <span className="accent-dot" />
                <span className="text-sm font-medium text-teal-700">What Drives Us</span>
              </div>

              <h2 className="heading-section text-foundation-charcoal mb-10">
                Our Purpose & Values
              </h2>

              <div className="space-y-6">
                {/* Mission */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 overflow-hidden group hover:shadow-elevated transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-teal-700">Our Mission</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {mission}
                    </p>
                  </div>
                </motion.div>

                {/* Vision */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 overflow-hidden group hover:shadow-elevated transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-amber-700">Our Vision</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {vision}
                    </p>
                  </div>
                </motion.div>

                {/* Values */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="pt-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-sky-700">Our Values</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(Array.isArray(values) ? values : ['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation']).map((value, i) => (
                      <motion.span
                        key={String(value)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="px-5 py-2.5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-teal-300 hover:shadow-md transition-all duration-300"
                      >
                        {String(value)}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline - Premium */}
      <section className="section-padding bg-foundation-cream relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[120px]" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="badge-premium mx-auto mb-6">
              <span className="accent-dot" />
              <span className="text-sm font-medium text-teal-700">Our Journey</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal mb-6">
              A Decade of Impact
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From humble beginnings to a nationally recognized foundation,
              our journey has been marked by countless stories of transformation.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-amber-400 hidden lg:block rounded-full" />

            <div className="space-y-16">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex items-center gap-12 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="card-elegant p-8 inline-block hover:shadow-dramatic transition-all duration-500"
                    >
                      <div className="flex items-center gap-4 mb-4 lg:justify-end">
                        <span className="text-4xl">{item.icon}</span>
                        <div className="font-display text-4xl font-bold text-gradient">
                          {item.year}
                        </div>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </motion.div>
                  </div>

                  {/* Center node */}
                  <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="w-6 h-6 bg-white rounded-full border-4 border-teal-500 shadow-lg z-10"
                    />
                    <div className="absolute w-12 h-12 bg-teal-400/20 rounded-full animate-ping" />
                  </div>

                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section - Premium Org Chart */}
      <section id="leadership" className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="badge-premium mx-auto mb-6">
              <span className="accent-dot" />
              <span className="text-sm font-medium text-teal-700">Our People</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal mb-6">
              Organizational Structure
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our dedicated leadership team brings together decades of experience in
              philanthropy, business, and community development.
            </p>
          </motion.div>

          {/* Premium Org Chart Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <OrgChart
              members={teamMembers as Parameters<typeof OrgChart>[0]['members']}
              variant="department"
              showFilters={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Annual Reports - Premium Dark Section */}
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
              <div className="badge-premium bg-white/5 border-white/10 mb-6">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-sm font-medium text-white/80">Transparency</span>
              </div>

              <h2 className="heading-section text-white mb-6">
                Annual Reports
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                We believe in complete transparency. Our annual reports provide detailed
                insights into our programs, financial allocation, and the impact we&apos;ve
                created together with our donors and partners.
              </p>

              <div className="space-y-4">
                {['2025', '2024', '2023'].map((year, i) => (
                  <motion.a
                    key={year}
                    href={`/reports/annual-report-${year}.pdf`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-amber-500/20 rounded-xl flex items-center justify-center group-hover:from-amber-400/30 group-hover:to-amber-500/30 transition-all">
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">Annual Report {year}</div>
                        <div className="text-gray-500 text-sm">PDF Document</div>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-500 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </motion.a>
                ))}
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
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-glow-teal">
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
                  className="absolute top-4 right-4 card-glass-dark px-4 py-2"
                >
                  <span className="text-white/80 text-sm font-medium">ISO Certified</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-4 left-4 card-glass-dark px-4 py-2"
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
          <div className="absolute inset-0 bg-gradient-to-r from-teal-800/95 via-teal-700/90 to-sky-700/95" />
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
              <Link href="/donate" className="btn-secondary">
                Donate Now
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="btn-outline border-white/40 text-white hover:bg-white hover:text-teal-700 hover:border-white"
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
