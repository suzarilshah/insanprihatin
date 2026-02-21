'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function Problem() {
  const t = useTranslations('problem')
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])

  const barriers = [
    {
      key: 'systemic',
      icon: "🏛️"
    },
    {
      key: 'health',
      icon: "🩺"
    },
    {
      key: 'education',
      icon: "🎓"
    }
  ]

  return (
    <section ref={containerRef} className="py-28 md:py-32 bg-foundation-pearl text-foundation-charcoal relative overflow-hidden">
      {/* Context-setting problem statement */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual narrative */}
          <div className="relative order-2 lg:order-1">
            <motion.div style={{ y }} className="relative z-10">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1547082688-9077fe60b8f9?q=80&w=2000&auto=format&fit=crop"
                  alt={t('imageAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
              </div>

              <div className="absolute -bottom-10 left-6 right-6 bg-white/95 p-6 rounded-2xl shadow-xl border border-white/70 hidden md:block">
                <div className="text-xs uppercase tracking-[0.2em] text-teal-700 mb-2">{t('urgencyTitle')}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{t('urgencyDescription')}</p>
              </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-50 rounded-full blur-[100px] -z-10" />
          </div>

          {/* Problem copy and barriers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-12 h-[3px] bg-amber-400" />
              <span className="text-teal-700 font-bold uppercase tracking-widest text-xs">{t('badge')}</span>
            </div>

            <h2 className="heading-section mb-8 text-foundation-charcoal">
              {t('title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600 italic font-serif">{t('titleHighlight')}</span>
            </h2>

            <p className="body-large text-gray-600 mb-10">
              {t('description')}
            </p>

            <div className="grid gap-6">
              {barriers.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-teal-100 group"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-foundation-charcoal mb-1 group-hover:text-teal-700 transition-colors">
                      {t(`barriers.${item.key}.title`)}
                    </h4>
                    <p className="text-sm text-gray-600">{t(`barriers.${item.key}.description`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
