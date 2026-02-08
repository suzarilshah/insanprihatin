'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

export default function Problem() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section ref={containerRef} className="py-32 bg-foundation-pearl text-foundation-charcoal relative overflow-hidden">
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Visual Side */}
          <div className="relative order-2 lg:order-1">
             <motion.div style={{ y }} className="relative z-10">
               <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                 <Image 
                   src="https://images.unsplash.com/photo-1547082688-9077fe60b8f9?q=80&w=2000" 
                   alt="Community struggle during monsoon" 
                   fill 
                   className="object-cover"
                 />
                 <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
               </div>
               
               {/* Floating Statistic */}
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="absolute -bottom-12 -right-12 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block"
               >
                 <div className="text-4xl font-display font-bold text-teal-600 mb-2">2.4M</div>
                 <p className="text-sm text-gray-600 leading-relaxed">Families in Malaysia currently living below the relative poverty line.</p>
               </motion.div>
             </motion.div>

             {/* Background decorative blob */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-50 rounded-full blur-[100px] -z-10" />
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-12 h-[3px] bg-amber-400" />
              <span className="text-teal-700 font-bold uppercase tracking-widest text-xs">The Reality</span>
            </div>

            <h2 className="heading-section mb-8 text-foundation-charcoal">
              The Silent Crisis in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600 italic font-serif">Our Backyard</span>
            </h2>

            <p className="body-large text-gray-600 mb-10">
              While skylines rise, thousands are left in the shadows. 
              The gap between survival and stability is widening, leaving vulnerable communities 
              trapped in a cycle of poverty that is impossible to break without intervention.
            </p>

            <div className="grid gap-6">
              {[
                { 
                  title: "Systemic Barriers", 
                  desc: "Lack of documentation and access prevents basic aid.",
                  icon: "🏛️"
                },
                { 
                  title: "Health Inequality", 
                  desc: "Treatable conditions become life sentences without care.",
                  icon: "🩺"
                },
                { 
                  title: "Education Gap", 
                  desc: "Children inherit poverty instead of opportunity.",
                  icon: "🎓"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
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
                    <h4 className="font-heading text-lg font-bold text-foundation-charcoal mb-1 group-hover:text-teal-700 transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
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
