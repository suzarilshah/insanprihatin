'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-foundation-charcoal via-gray-900 to-foundation-charcoal" />
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-600/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
              <span className="text-amber-400 font-medium uppercase tracking-wider text-sm">Join Us</span>
            </div>

            <h2 className="heading-section text-white mb-6">
              Be Part of Something{' '}
              <span className="text-gradient-amber">Greater</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Your contribution, no matter the size, creates ripples of positive change.
              Join thousands of donors who are helping us build a more compassionate Malaysia.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/donate" className="btn-secondary">
                Donate Now
              </Link>
              <Link href="/contact?type=volunteer" className="btn-outline border-white/30 text-white hover:bg-white hover:text-foundation-charcoal">
                Become a Volunteer
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-4">Trusted by leading organizations</p>
              <div className="flex items-center gap-8 opacity-50">
                {/* Partner logo placeholders */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-8 bg-white/20 rounded" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Donation Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-elevated">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14">
                  <Image
                    src="/images/logo.png"
                    alt="Yayasan Insan Prihatin"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal">
                    Quick Donation
                  </h3>
                  <p className="text-gray-500 text-sm">100% goes to our programs</p>
                </div>
              </div>

              {/* Amount Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['RM 50', 'RM 100', 'RM 250'].map((amount, index) => (
                  <button
                    key={amount}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      index === 1
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-foundation-charcoal hover:bg-teal-50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RM</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="input-elegant pl-12"
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select program (optional)
                </label>
                <select className="input-elegant">
                  <option value="">General Fund</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="community">Community Development</option>
                </select>
              </div>

              <Link
                href="/donate"
                className="block w-full btn-primary text-center"
              >
                Continue to Donate
              </Link>

              <p className="text-center text-gray-400 text-xs mt-4">
                Secure payment powered by trusted partners
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
