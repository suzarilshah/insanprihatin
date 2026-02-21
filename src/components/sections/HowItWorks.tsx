'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const stepKeys = [
  {
    id: '01',
    key: 'identify',
    color: 'from-sky-400 to-sky-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7l3-7z" />
      </svg>
    ),
  },
  {
    id: '02',
    key: 'mobilize',
    color: 'from-teal-400 to-teal-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: '03',
    key: 'transform',
    color: 'from-amber-400 to-amber-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const t = useTranslations('howItWorks')

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Simple, transparent process */}
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="container-wide relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-section text-foundation-charcoal mb-6"
          >
            {t('title')} <br />
            <span className="text-teal-600 italic font-serif">{t('titleHighlight')}</span>
          </motion.h2>
          <p className="body-large text-gray-600">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="absolute top-12 left-0 w-full h-[2px] bg-gray-100 hidden md:block -z-10" />

          {stepKeys.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group"
            >
              <div className="card-elegant p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg`}>
                    {step.icon}
                  </div>
                  <span className="text-sm text-foundation-slate uppercase tracking-[0.2em]">{step.id}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-foundation-charcoal mb-3 group-hover:text-teal-600 transition-colors">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(`steps.${step.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
