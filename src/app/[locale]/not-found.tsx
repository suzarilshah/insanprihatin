'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'

export default function NotFound() {
  const locale = useLocale()
  const t = useTranslations('notFound')

  return (
    <div className="min-h-screen bg-foundation-charcoal flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px]"
        />

        {/* Subtle arc at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[400px]">
          <div className="absolute inset-0 border-t border-white/5 rounded-[100%]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <span className="text-white/80 font-medium group-hover:text-white transition-colors">
              Yayasan Insan Prihatin
            </span>
          </Link>

          <Link
            href={`/${locale}`}
            className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <span>{t('backToHome')}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Number */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[12rem] sm:text-[16rem] lg:text-[20rem] font-bold text-white leading-none tracking-tighter select-none"
            style={{
              textShadow: '0 0 100px rgba(255,255,255,0.05)',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/70 text-lg sm:text-xl mt-2 mb-12 max-w-md mx-auto"
          >
            {t('message')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href={`/${locale}`}
              className="group inline-flex flex-col items-center gap-3 text-white/50 hover:text-white transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                <svg
                  className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-sm font-medium tracking-wide">
                {t('goHome')}
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
          {/* Contact */}
          <div className="text-center sm:text-left">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
              {t('needHelp')}
            </p>
            <a
              href="mailto:admin@insanprihatin.org"
              className="text-white/70 hover:text-white transition-colors"
            >
              admin@insanprihatin.org
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-white/40">
            <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
              {t('links.about')}
            </Link>
            <Link href={`/${locale}/projects`} className="hover:text-white transition-colors">
              {t('links.projects')}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
              {t('links.contact')}
            </Link>
            <Link href={`/${locale}/donate`} className="hover:text-white transition-colors">
              {t('links.donate')}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Yayasan Insan Prihatin
          </p>
        </div>
      </footer>
    </div>
  )
}
