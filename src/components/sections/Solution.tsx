'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { type LocalizedString, type Locale, getLocalizedValue } from '@/i18n/config'
import { useTranslations } from 'next-intl'
import { PhotoAttributionOverlay } from '@/components/ui/PhotoAttribution'
import { useUnsplashTracking } from '@/hooks/useUnsplashTracking'
import { type StockPhotoItem, DEFAULT_STOCK_PHOTOS } from '@/lib/stock-photo-config'

interface Project {
  id: string
  slug: string
  title: LocalizedString | string
  description: LocalizedString | string
  featuredImage?: string | null
  category?: string | null
}

interface ImpactStat {
  id: string
  label: LocalizedString | string
  value: string
  icon?: string | null
  suffix?: LocalizedString | string | null
}

interface AboutContent {
  mission?: LocalizedString | string | null
  vision?: LocalizedString | string | null
}

interface StockPhotoFallbacks {
  solutionFeatured?: StockPhotoItem
  solutionProject1?: StockPhotoItem
  solutionProject2?: StockPhotoItem
}

interface SolutionProps {
  projects?: Project[]
  impactStats?: ImpactStat[]
  aboutContent?: AboutContent | null
  locale?: Locale
  stockPhotos?: StockPhotoFallbacks
}

export default function Solution({ projects = [], impactStats = [], aboutContent, locale = 'en', stockPhotos }: SolutionProps) {
  const t = useTranslations('solution')
  // Helper to get localized value
  const l = (value: LocalizedString | string | null | undefined): string => {
    return getLocalizedValue(value as LocalizedString, locale)
  }
  const localized = (value: LocalizedString | string | null | undefined): string => (value ? l(value) : '')

  // Get stock photos with defaults
  const featuredStock = stockPhotos?.solutionFeatured || DEFAULT_STOCK_PHOTOS.solutionFeatured
  const project1Stock = stockPhotos?.solutionProject1 || DEFAULT_STOCK_PHOTOS.solutionProject1
  const project2Stock = stockPhotos?.solutionProject2 || DEFAULT_STOCK_PHOTOS.solutionProject2

  // Track stock photo views (only track if actually using stock photo)
  const usesStockFeatured = !projects[0]?.featuredImage
  const usesStockProject1 = !projects[1]?.featuredImage
  const usesStockProject2 = !projects[2]?.featuredImage

  useUnsplashTracking(usesStockFeatured ? featuredStock.photoId : null)
  useUnsplashTracking(usesStockProject1 ? project1Stock.photoId : null)
  useUnsplashTracking(usesStockProject2 ? project2Stock.photoId : null)

  const benefits = [
    {
      key: 'clarity',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'community',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-1a4 4 0 00-4-4h-1" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20H4v-1a4 4 0 014-4h1" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      ),
    },
    {
      key: 'continuity',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      key: 'storytelling',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5M6 4h12a2 2 0 012 2v12l-4-3H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      ),
    },
  ]

  const hasProjects = projects.length > 0
  const primaryStat = impactStats[0]
  const hasImpactStat = Boolean(primaryStat?.value)

  return (
    <section className="section-padding bg-foundation-charcoal relative overflow-hidden text-white">
      {/* Solution section with dark, focused backdrop */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      
      <div className="container-wide relative z-10">

        {/* Section header and CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 border-b border-white/10 pb-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 font-medium uppercase tracking-widest text-xs mb-4"
            >
              {t('title')}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="heading-section text-white"
            >
              {t('subtitle')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">{t('subtitleHighlight')}</span>
            </motion.h2>
            <p className="text-white/70 mt-6 max-w-xl">
              {t('description')}
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/projects" className="btn-outline border-white/20 text-white hover:bg-white hover:text-foundation-charcoal">
              {t('viewAllProjects')}
            </Link>
          </motion.div>
        </div>

        {/* Outcome-focused benefits */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="w-10 h-10 rounded-full bg-teal-500/15 text-teal-200 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-white font-heading text-lg mb-2">{t(`benefits.${benefit.key}.title`)}</h3>
              <p className="text-sm text-white/70">{t(`benefits.${benefit.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        {/* Projects and proof */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
          
          {/* Main Feature - Large Card */}
          {projects[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 md:row-span-2 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[0].slug}`} className="block h-full">
                <Image
                  src={projects[0].featuredImage || featuredStock.url}
                  alt={l(projects[0].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-10 max-w-2xl">
                  <div className="inline-block px-3 py-1 bg-amber-400 text-foundation-charcoal text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    {projects[0].category || t('featured')}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-heading text-white mb-4 leading-tight">
                    {l(projects[0].title)}
                  </h3>
                  <p className="text-lg text-gray-200 line-clamp-2 mb-6 font-light">
                    {l(projects[0].description)}
                  </p>
                  <span className="inline-flex items-center text-amber-300 font-medium group-hover:translate-x-2 transition-transform">
                    {t('readStory')} <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
                {/* Unsplash Attribution (only for stock photos) */}
                {usesStockFeatured && (
                  <PhotoAttributionOverlay
                    photographerName={featuredStock.photographerName}
                    photographerUsername={featuredStock.photographerUsername}
                    position="bottom-right"
                    showOnHover={true}
                  />
                )}
              </Link>
            </motion.div>
          )}

          {!hasProjects && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 md:row-span-2 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Image
                src={featuredStock.url}
                alt={t('projectsEmptyTitle')}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                quality={80}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/70 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 p-10 max-w-2xl">
                <div className="inline-block px-3 py-1 bg-amber-400 text-foundation-charcoal text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  {t('featured')}
                </div>
                <h3 className="text-3xl md:text-4xl font-heading text-white mb-4 leading-tight">
                  {t('projectsEmptyTitle')}
                </h3>
                <p className="text-base text-gray-200 mb-6 font-light">
                  {t('projectsEmptyDescription')}
                </p>
                <Link href="/projects" className="inline-flex items-center text-amber-300 font-medium">
                  {t('viewAllProjects')} <span className="ml-2">→</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Stats Card - Dark */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-teal-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[50px]" />
            {hasImpactStat ? (
              <>
                <h4 className="text-teal-200 uppercase tracking-widest text-xs font-medium mb-2">{t('totalImpact')}</h4>
                <div className="text-5xl font-display font-bold text-white mb-2">
                  {primaryStat?.value}{localized(primaryStat?.suffix)}
                </div>
                <p className="text-teal-100">{localized(primaryStat?.label) || t('livesChanged')}</p>
              </>
            ) : (
              <>
                <h4 className="text-teal-200 uppercase tracking-widest text-xs font-medium mb-2">{t('impactStatementTitle')}</h4>
                <p className="text-white/80 text-base leading-relaxed">{t('impactStatementDescription')}</p>
              </>
            )}
          </motion.div>

          {/* Secondary Project 1 */}
          {projects[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-4 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[1].slug}`} className="block h-full">
                <Image
                  src={projects[1].featuredImage || project1Stock.url}
                  alt={l(projects[1].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-teal-950/70 group-hover:bg-teal-900/60 transition-colors" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-heading text-white mb-2">{l(projects[1].title)}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2">{l(projects[1].description)}</p>
                </div>
                {/* Unsplash Attribution (only for stock photos) */}
                {usesStockProject1 && (
                  <PhotoAttributionOverlay
                    photographerName={project1Stock.photographerName}
                    photographerUsername={project1Stock.photographerUsername}
                    position="bottom-right"
                    showOnHover={true}
                  />
                )}
              </Link>
            </motion.div>
          )}

           {/* Secondary Project 2 */}
           {projects[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-4 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[2].slug}`} className="block h-full">
                <Image
                  src={projects[2].featuredImage || project2Stock.url}
                  alt={l(projects[2].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-teal-950/70 group-hover:bg-teal-900/60 transition-colors" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-heading text-white mb-2">{l(projects[2].title)}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2">{l(projects[2].description)}</p>
                </div>
                {/* Unsplash Attribution (only for stock photos) */}
                {usesStockProject2 && (
                  <PhotoAttributionOverlay
                    photographerName={project2Stock.photographerName}
                    photographerUsername={project2Stock.photographerUsername}
                    position="bottom-right"
                    showOnHover={true}
                  />
                )}
              </Link>
            </motion.div>
          )}

          {/* About/Mission Snippet */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h4 className="text-white font-heading text-xl mb-2">{t('ourMission')}</h4>
              <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">
                {l(aboutContent?.mission) || t('defaultMission')}
              </p>
              <Link href="/about" className="text-white text-xs font-bold uppercase tracking-wider hover:underline">{t('readMore')} →</Link>
            </div>
          </motion.div>
          
        </div>

      </div>
    </section>
  )
}
