'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string | null
  communityImage?: string | null
}

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop'
const DEFAULT_COMMUNITY = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=1600&auto=format&fit=crop'

export default function Hero({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink = '/projects',
  backgroundImage,
  communityImage,
}: HeroProps) {
  const t = useTranslations('hero')

  // Use translations as defaults if props not provided
  const displayTitle = title || t('defaultTitle')
  const displaySubtitle = subtitle || t('defaultSubtitle')
  const displayDescription = description || t('defaultDescription')
  const displayCtaText = ctaText || t('defaultCta')

  const bgImage = backgroundImage || DEFAULT_BACKGROUND
  const trustPoints = [t('trustPointOne'), t('trustPointTwo'), t('trustPointThree')]
  const titleWords = displayTitle.split(' ')
  const highlightWords = titleWords.length > 2 ? titleWords.slice(-2).join(' ') : titleWords.slice(-1).join(' ')
  const leadingWords = titleWords.slice(0, titleWords.length - highlightWords.split(' ').length).join(' ')
  const containerRef = useRef<HTMLElement>(null)
  // Delay heavy animations until after initial render for better LCP
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Small delay to allow LCP to complete before heavy animations
    const timer = setTimeout(() => setIsHydrated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Hero background with cinematic overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ scale: isHydrated ? heroScale : 1 }} className="absolute inset-0">
          <Image
            src={bgImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={80}
            fetchPriority="high"
          />
        </motion.div>

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/90 via-teal-900/75 to-sky-900/55" />

        {/* Noise texture for depth - deferred */}
        {isHydrated && (
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        )}
      </div>

      {/* Animated Atmospheric Elements - Deferred for better LCP */}
      {isHydrated && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-teal-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-amber-500/10 rounded-full blur-[100px]"
          />
        </div>
      )}

      {/* Hero content */}
      <motion.div
        style={{ opacity: isHydrated ? heroOpacity : 1 }}
        className="relative container-wide pt-28 md:pt-36 pb-16 md:pb-24 z-10"
      >
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Outcome-driven copy and CTAs */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] md:text-xs font-medium text-white tracking-widest uppercase shadow-sm">{displaySubtitle}</span>
              </div>
              <span className="text-[11px] md:text-xs text-white/70 uppercase tracking-[0.25em]">{t('tagline')}</span>
            </div>

            <h1 className="heading-display text-white mb-6 md:mb-8 drop-shadow-lg">
              {leadingWords && <span className="block">{leadingWords}</span>}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-teal-200 to-white">
                {highlightWords}
              </span>
            </h1>

            <p className="body-large text-white/90 mb-8 md:mb-10 max-w-xl">
              {displayDescription}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href={ctaLink} className="btn-primary">
                {displayCtaText}
              </Link>
              <Link href="/blog" className="btn-outline border-white/30 text-white hover:bg-white hover:text-foundation-charcoal">
                {t('secondaryCta')}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {trustPoints.map((point) => (
                <div key={point} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                  {point}
                </div>
              ))}
            </div>

            <div className="mt-5 text-sm text-white/75">
              {t('donationHint')}{' '}
              <Link href="/donate" className="text-amber-200 hover:text-amber-100 underline underline-offset-4">
                {t('donationCta')}
              </Link>
            </div>
          </div>

          {/* Hero visual with supporting context */}
          <div className="lg:col-span-5 relative hidden lg:block">
            {isHydrated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <Image
                    src={communityImage || DEFAULT_COMMUNITY}
                    alt={t('visualAlt')}
                    fill
                    sizes="(max-width: 1024px) 0vw, 40vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-teal-900/10 to-transparent" />
                </div>

                <div className="absolute -bottom-8 left-8 right-8 bg-white/95 text-foundation-charcoal rounded-2xl p-5 shadow-2xl border border-white/60">
                  <div className="text-xs uppercase tracking-[0.2em] text-teal-700 mb-2">
                    {t('visualCaptionTitle')}
                  </div>
                  <p className="text-sm leading-relaxed text-foundation-slate">
                    {t('visualCaption')}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      {isHydrated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 hidden md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{t('scrollToExplore')}</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </motion.div>
      )}
    </section>
  )
}
