'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
}

export default function Hero({
  title = 'Empowering Communities Through Compassion',
  subtitle = 'Yayasan Insan Prihatin',
  description = 'Building a better tomorrow through education, healthcare, and sustainable development. Join us in creating lasting impact for communities across Malaysia.',
  ctaText = 'Explore Our Impact',
  ctaLink = '/projects',
}: HeroProps) {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Premium Background with Malaysia community image */}
      <div className="absolute inset-0">
        {/* Background Image - Malaysian community/charitable work */}
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 scale-110">
          <Image
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2574"
            alt="Malaysian community coming together"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-sky-900/85" />

        {/* Secondary gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/60 via-transparent to-transparent" />

        {/* Decorative mesh gradient */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              <radialGradient id="mesh1" cx="20%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#F5A623" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="mesh2" cx="80%" cy="70%" r="50%">
                <stop offset="0%" stopColor="#3BABE8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3BABE8" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#mesh1)" />
            <rect width="100%" height="100%" fill="url(#mesh2)" />
          </svg>
        </div>

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Film grain for premium texture */}
        <div className="grain" />
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-sky-400/15 rounded-full blur-[100px]"
      />

      {/* Floating glassmorphism elements */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute top-[20%] right-[10%] hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 card-glass-dark flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-[25%] left-[8%] hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 card-glass-dark flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: textY, opacity }} className="relative container-wide pt-32 pb-20 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Premium badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="badge-premium bg-white/10 text-white/90 mb-8"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium tracking-wide">{subtitle}</span>
            </motion.div>

            <h1 className="heading-display text-white mb-8">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block"
              >
                {title.split(' ').slice(0, 2).join(' ')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block text-gradient-amber"
              >
                {title.split(' ').slice(2).join(' ')}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="body-large text-white/80 mb-12 max-w-xl"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href={ctaLink} className="btn-secondary group">
                {ctaText}
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/donate"
                className="btn-outline border-white/40 text-white hover:bg-white hover:text-teal-700 hover:border-white"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                Make a Donation
              </Link>
            </motion.div>

            {/* Premium Stats with glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-16"
            >
              <div className="card-glass-dark p-6 inline-flex gap-8 md:gap-12">
                {[
                  { value: '50K+', label: 'Lives Impacted', icon: '👥' },
                  { value: 'RM 15M', label: 'Funds Raised', icon: '💰' },
                  { value: '120+', label: 'Projects', icon: '🎯' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="font-display text-3xl lg:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-white/60 text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Premium Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Glowing backdrop rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[500px] h-[500px] rounded-full border border-white/10" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[400px] h-[400px] rounded-full border border-amber-400/20" />
              </motion.div>

              {/* Central glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] bg-gradient-radial from-amber-400/30 via-amber-400/10 to-transparent rounded-full blur-2xl" />
              </div>

              {/* Logo container with premium treatment */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex items-center justify-center h-[500px]"
              >
                <div className="relative w-80 h-80">
                  {/* Logo shadow/glow */}
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-110" />
                  <Image
                    src="/images/logo.png"
                    alt="Yayasan Insan Prihatin"
                    fill
                    className="object-contain drop-shadow-2xl relative z-10"
                    priority
                  />
                </div>
              </motion.div>

              {/* Orbiting accent elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-[450px] h-[450px]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-lg">
                    <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-50" />
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-[380px] h-[380px]">
                  <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-sky-400 rounded-full" />
                  <div className="absolute top-1/4 left-0 w-2 h-2 bg-teal-300 rounded-full" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-white/50 text-xs uppercase tracking-[0.2em] font-medium">Discover More</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-white/70 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
