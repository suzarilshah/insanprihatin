'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface AboutProps {
  title?: string
  content?: string
  mission?: string
  vision?: string
  image?: string
}

export default function About({
  title,
  content,
  mission,
  vision,
}: AboutProps) {
  const t = useTranslations('homeAbout')

  const values = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t('values.compassion.title'),
      description: t('values.compassion.description'),
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('values.integrity.title'),
      description: t('values.integrity.description'),
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('values.community.title'),
      description: t('values.community.description'),
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('values.impact.title'),
      description: t('values.impact.description'),
    },
  ]

  const displayTitle = title || t('title')
  const displayContent = content || t('content')
  const displayMission = mission || t('mission')
  const displayVision = vision || t('vision')
  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              {/* Main image placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-200">
                <Image
                  src="/images/logo-light.png"
                  alt="Yayasan Insan Prihatin"
                  fill
                  className="object-contain p-12 opacity-80"
                />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-elevated p-6 max-w-[260px]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foundation-charcoal">{t('impactAmount')}</div>
                    <div className="text-gray-600 text-sm">{t('totalImpact')}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {t('impactDescription')}
                </p>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-teal-100 rounded-2xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 border-2 border-amber-200 rounded-full -z-10" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="accent-line" />
              <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">{t('label')}</span>
            </div>

            <h2 className="heading-section text-foundation-charcoal mb-6">
              {displayTitle}
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {displayContent}
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-teal-50 rounded-2xl">
                <h3 className="font-heading text-xl font-semibold text-teal-700 mb-3">{t('ourMission')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{displayMission}</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl">
                <h3 className="font-heading text-xl font-semibold text-amber-700 mb-3">{t('ourVision')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{displayVision}</p>
              </div>
            </div>

            <Link href="/about" className="btn-primary">
              {t('learnMore')}
            </Link>
          </motion.div>
        </div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h3 className="heading-subsection text-foundation-charcoal">{t('coreValues')}</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elegant p-8 text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-teal-600 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-300">
                  {value.icon}
                </div>
                <h4 className="font-heading text-xl font-semibold text-foundation-charcoal mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
