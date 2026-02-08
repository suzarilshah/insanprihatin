'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Methodology from '@/components/sections/Methodology'
import { type LocalizedString, getLocalizedValue, type Locale } from '@/i18n/config'

type Project = {
  id: string
  slug: string
  title: LocalizedString | string
  subtitle: LocalizedString | string | null
  description: LocalizedString | string
  content: LocalizedString | string | null
  featuredImage: string | null
  gallery: unknown
  category: string | null
  status: string | null
  startDate: Date | null
  endDate: Date | null
  budget: string | null
  beneficiaries: number | null
  location: string | null
  isPublished: boolean | null
  metaTitle: LocalizedString | string | null
  metaDescription: LocalizedString | string | null
  createdAt: Date
  updatedAt: Date
}

interface ProjectsContentProps {
  projects: Project[]
  locale?: Locale
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  upcoming: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
}

const defaultImage = 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670'

export default function ProjectsContent({ projects, locale = 'en' }: ProjectsContentProps) {
  const t = useTranslations('projectsPage')
  const [activeCategory, setActiveCategory] = useState('all')
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  // Helper to get string from LocalizedString
  const l = (value: LocalizedString | string | null | undefined): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return getLocalizedValue(value, locale)
  }

  const categoryKeys = ['all', 'education', 'healthcare', 'environment', 'community'] as const
  const categoryIcons: Record<string, string> = {
    all: '🎯',
    education: '🎓',
    healthcare: '🏥',
    environment: '🌳',
    community: '🏘️',
  }

  // Get unique categories from projects and merge with defaults
  const projectCategories = [...new Set(projects.map(p => p.category).filter(Boolean))]
  const categories: Array<{ id: string; name: string; icon: string; count: number }> = categoryKeys.map(cat => ({
    id: cat,
    name: t(`categories.${cat}`),
    icon: categoryIcons[cat] || '📁',
    count: cat === 'all'
      ? projects.length
      : projects.filter(p => p.category === cat).length
  })).filter(cat => cat.id === 'all' || cat.count > 0 || projectCategories.includes(cat.id))

  // Add any custom categories from projects that aren't in defaults
  projectCategories.forEach(cat => {
    if (cat && !(categoryKeys as readonly string[]).includes(cat)) {
      categories.push({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: '📁',
        count: projects.filter(p => p.category === cat).length
      })
    }
  })

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  // Calculate total stats from projects
  const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0)
  const totalProjects = projects.length
  const uniqueLocations = [...new Set(projects.map(p => p.location).filter(Boolean))].length

  return (
    <div>
      {/* Premium Hero Section */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670"
            alt="Community project"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Nav-Safe Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal/95 via-foundation-charcoal/80 to-foundation-charcoal/40" />
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="grain" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[100px]"
        />

        <motion.div style={{ opacity: heroOpacity }} className="relative container-wide z-10 pt-20">
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
              <span className="text-sm font-medium tracking-wide text-white uppercase">{t('badge')}</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                {t('heroTitle')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 animate-gradient-x"
              >
                {t('heroTitleHighlight')}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80 max-w-2xl border-l-2 border-amber-400/50 pl-6"
            >
              {t('heroDescription')}
            </motion.p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl inline-flex gap-8 md:gap-12 p-6">
              {[
                { value: `${totalProjects}+`, label: t('stats.activeProjects') },
                { value: totalBeneficiaries > 0 ? `${(totalBeneficiaries / 1000).toFixed(0)}K+` : '0', label: t('stats.livesImpacted') },
                { value: `${uniqueLocations || 1}+`, label: t('stats.communitiesServed') },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-2xl lg:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Methodology Section - The "How" */}
      <Methodology />

      {/* Projects Section */}
      <section className="section-padding bg-foundation-pearl relative">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[150px]" />

        <div className="relative container-wide">
          <div className="text-center mb-16">
             <h2 className="heading-section text-foundation-charcoal mb-4">
               {t('initiatives.title')} <span className="text-teal-600 italic font-serif">{t('initiatives.titleHighlight')}</span>
             </h2>
             <p className="text-gray-500 max-w-xl mx-auto">
               {t('initiatives.description')}
             </p>
          </div>

          {/* Category Filter - Premium Pills */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-3 mb-16"
            >
              {categories.map((category, i) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-medium transition-all duration-400 ${
                    activeCategory === category.id
                      ? 'bg-foundation-charcoal text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 shadow-sm border border-gray-100'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => {
                  const status = statusConfig[project.status || 'ongoing'] || statusConfig.ongoing

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      layout
                    >
                      <Link
                        href={`/projects/${project.slug}`}
                        className="block bg-white rounded-3xl overflow-hidden group h-full flex flex-col shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500"
                      >
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={project.featuredImage || defaultImage}
                            alt={l(project.title)}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Status badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${status.bg} ${status.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                              {project.status || 'ongoing'}
                            </span>
                          </div>

                          {/* Category badge */}
                          {project.category && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 capitalize">
                                {project.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 mb-3">
                            {project.category && (
                              <>
                                <span className="text-teal-600 text-sm font-bold uppercase tracking-wide">
                                  {project.category}
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              </>
                            )}
                            <span className="text-gray-400 text-sm">{project.location || 'Malaysia'}</span>
                          </div>

                          <h3 className="font-heading text-xl font-bold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                            {l(project.title)}
                          </h3>

                          {l(project.subtitle) && (
                            <p className="text-teal-600 text-sm font-medium mb-3">{l(project.subtitle)}</p>
                          )}

                          <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
                            {l(project.description)}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                            {project.beneficiaries ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-medium">{project.beneficiaries.toLocaleString()}</span>
                                <span className="text-gray-400">{t('card.beneficiaries')}</span>
                              </div>
                            ) : (
                              <div />
                            )}

                            <div className="flex items-center gap-1 text-teal-600 font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                              {t('card.viewImpact')}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                    {t('noProjects.title')}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t('noProjects.description')}
                  </p>
                  <Link href="/contact" className="btn-primary">
                    {t('noProjects.cta')}
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Impact CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2670"
                alt="Volunteers"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-teal-900/80" />
            </div>

            <div className="relative py-20 px-8 lg:px-20 z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block text-5xl mb-4"
                  >
                    🚀
                  </motion.span>

                  <h2 className="heading-subsection text-white mb-4">
                    {t('cta.title')}
                  </h2>
                  <p className="text-white/80 text-lg mb-8 leading-relaxed">
                    {t('cta.description')}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/donate" className="btn-secondary shadow-lg hover:shadow-glow-amber">
                      {t('cta.donate')}
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      href="/contact"
                      className="btn-outline border-white/40 text-white hover:bg-white hover:text-teal-900"
                    >
                      {t('cta.partner')}
                    </Link>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'RM 2.5M', label: t('impactStats.targetFund') },
                      { value: '100%', label: t('impactStats.transparencyRate') },
                      { value: '2025', label: t('impactStats.yearEstablished') },
                      { value: locale === 'ms' ? 'Sifar' : 'Zero', label: t('impactStats.hiddenCosts') },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center"
                      >
                        <div className="font-display text-2xl font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-white/60 text-sm uppercase tracking-wide">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
