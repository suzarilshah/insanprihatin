'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const stepKeys = [
  { id: '01', key: 'identify', color: 'from-blue-400 to-blue-600' },
  { id: '02', key: 'mobilize', color: 'from-teal-400 to-teal-600' },
  { id: '03', key: 'transform', color: 'from-amber-400 to-amber-600' },
]

export default function HowItWorks() {
  const t = useTranslations('howItWorks')

  return (
    <section className="section-padding bg-white relative overflow-hidden">

      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-20">
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

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
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
              {/* Number/Icon */}
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-gray-50 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <span className={`text-3xl font-display font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.id}
                </span>
              </div>

              <div className="text-center px-4">
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
