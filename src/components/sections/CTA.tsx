'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function CTA() {
  const router = useRouter()
  const t = useTranslations('homeCta')
  const [customAmount, setCustomAmount] = useState<string>('')

  const handleDonate = () => {
    const amount = customAmount.trim()
    router.push(amount ? `/donate?amount=${encodeURIComponent(amount)}` : '/donate')
  }

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-foundation-charcoal">
      {/* Final CTA backdrop */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-foundation-charcoal via-gray-900 to-black" />
      
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />

      <div className="container-wide relative z-10">
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* CTA messaging */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="heading-section text-white mb-6">
                  {t('title')} <br />
                  <span className="text-amber-400">{t('titleHighlight')}</span>
                </h2>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                  {t('description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/projects" className="btn-primary">
                    {t('primaryCta')}
                  </Link>
                  <Link href="/blog" className="btn-outline border-white/20 text-white hover:bg-white hover:text-foundation-charcoal">
                    {t('secondaryCta')}
                  </Link>
                </div>

                <div className="mt-6 text-sm text-white/70">
                  {t('donatePrompt')}{' '}
                  <Link href="/donate" className="text-amber-200 hover:text-amber-100 underline underline-offset-4">
                    {t('donateNow')}
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Donation shortcut */}
            <div className="bg-white rounded-3xl p-8 shadow-xl relative">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-teal-100 rounded-full blur-2xl -z-10" />

              <div className="mb-6">
                <h3 className="text-foundation-charcoal font-heading text-xl font-bold mb-1">{t('donationTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('donationDescription')}</p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-sm font-semibold text-foundation-charcoal" htmlFor="donation-amount">
                  {t('amountLabel')}
                </label>
                <div className="relative">
                  <input
                    id="donation-amount"
                    type="number"
                    inputMode="decimal"
                    placeholder={t('amountPlaceholder')}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-medium text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">RM</span>
                </div>
                <p className="text-xs text-gray-500">{t('amountHint')}</p>
              </div>

              <button
                onClick={handleDonate}
                className="w-full btn-secondary py-4 text-center justify-center group"
              >
                {t('proceedToPayment')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
