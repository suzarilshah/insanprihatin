'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    id: 1,
    title: "Needs Assessment",
    description: "We work directly with local leaders to identify the most urgent gaps in education and infrastructure.",
    icon: (
      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Strategic Planning",
    description: "Our experts design sustainable solutions that use local resources and empower community ownership.",
    icon: (
      <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Sustainable Impact",
    description: "We don't just build; we train, monitor, and ensure long-term success before handing over.",
    icon: (
      <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
]

export default function Methodology() {
  return (
    <section className="section-padding bg-foundation-pearl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/20 rounded-full blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-[120px] mix-blend-multiply" />
      
      <div className="container-wide relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-teal-700 font-medium uppercase tracking-wider text-xs">Our Approach</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-foundation-charcoal"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Longevity</span>
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-gray-500 max-w-2xl mx-auto mt-4"
          >
            We move beyond temporary aid to establish systems of self-reliance.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2 hidden md:block">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-amber-400 via-teal-500 to-sky-500 origin-left shadow-[0_0_10px_rgba(20,184,166,0.5)]"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl group hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center mb-8 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-amber-500/5 rounded-2xl" />
                  {step.icon}
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-foundation-charcoal text-white rounded-full flex items-center justify-center font-display text-lg border-4 border-white shadow-md group-hover:bg-teal-600 transition-colors">
                    {step.id}
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-bold text-foundation-charcoal text-center mb-4 group-hover:text-teal-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-center leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
