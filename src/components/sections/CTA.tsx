'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DONATION_AMOUNTS = [50, 100, 250, 500]

export default function CTA() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState<string>('')
  
  const handleDonate = () => {
    const amount = customAmount ? customAmount : selectedAmount
    router.push(`/donate?amount=${amount}`)
  }

  return (
    <section className="relative py-32 overflow-hidden bg-foundation-charcoal">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-br from-foundation-charcoal via-gray-900 to-black" />
      
      {/* Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />

      <div className="container-wide relative z-10">
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Side */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="heading-section text-white mb-6">
                  Ready to Make an <br />
                  <span className="text-amber-400">Immediate Impact?</span>
                </h2>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                  Join thousands of changemakers. Your contribution provides immediate relief and sustainable solutions for families in need.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/donate" className="btn-primary bg-amber-400 text-foundation-charcoal hover:bg-amber-300 border-none shadow-lg shadow-amber-400/20">
                    Donate Now
                  </Link>
                  <Link href="/contact" className="btn-outline border-white/20 text-white hover:bg-white hover:text-foundation-charcoal">
                    Volunteer With Us
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Mini Donation Form */}
            <div className="bg-white rounded-3xl p-8 shadow-xl relative">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-teal-100 rounded-full blur-2xl -z-10" />
              
              <div className="mb-6">
                <h3 className="text-foundation-charcoal font-heading text-xl font-bold mb-1">Quick Donation</h3>
                <p className="text-gray-500 text-sm">Secure & Tax Deductible</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                      selectedAmount === amount && !customAmount
                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/30'
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-white hover:border-teal-200'
                    }`}
                  >
                    RM {amount}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <input 
                  type="number" 
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">RM</span>
              </div>

              <button 
                onClick={handleDonate}
                className="w-full btn-secondary py-4 text-center justify-center group"
              >
                Proceed to Payment
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
