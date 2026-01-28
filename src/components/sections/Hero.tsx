'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

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
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-teal-600 to-sky-600">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-400/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-sky-400/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-[15%] hidden lg:block"
      >
        <div className="w-20 h-20 bg-amber-400/20 rounded-2xl backdrop-blur-sm border border-amber-400/30 rotate-12" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 left-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm border border-white/20" />
      </motion.div>

      {/* Content */}
      <div className="relative container-wide pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{subtitle}</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <span className="block">{title.split(' ').slice(0, 2).join(' ')}</span>
              <span className="text-gradient-amber">{title.split(' ').slice(2).join(' ')}</span>
            </h1>

            <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={ctaLink} className="btn-secondary group">
                {ctaText}
                <svg
                  className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/donate" className="btn-outline border-white/30 text-white hover:bg-white hover:text-teal-600">
                Make a Donation
              </Link>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20"
            >
              {[
                { value: '50K+', label: 'Lives Impacted' },
                { value: 'RM 15M', label: 'Funds Raised' },
                { value: '120+', label: 'Projects' },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="font-display text-3xl lg:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/60 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Logo/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              {/* Glowing backdrop */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-400/30 via-transparent to-transparent rounded-full blur-3xl" />

              {/* Logo container */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex items-center justify-center h-full"
              >
                <div className="relative w-80 h-80">
                  <Image
                    src="/images/logo.png"
                    alt="Yayasan Insan Prihatin"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>

              {/* Orbiting elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-glow-amber" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8"
              >
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-sky-400 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
