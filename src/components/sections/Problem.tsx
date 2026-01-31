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

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={containerRef} className="section-padding bg-foundation-charcoal text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal via-transparent to-foundation-charcoal" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-12 h-[2px] bg-amber-400" />
              <span className="text-amber-400 font-medium uppercase tracking-widest text-xs">The Reality</span>
            </div>

            <h2 className="heading-section mb-8 text-white">
              Thousands of Families Are <br />
              <span className="text-white/50 italic font-serif">Left Behind</span> in Silence.
            </h2>

            <p className="body-large text-gray-300 mb-8 max-w-xl">
              In the shadows of our bustling cities and remote villages, a silent crisis persists. 
              Lack of access to quality education, healthcare, and basic necessities traps generations 
              in a cycle of poverty that is nearly impossible to break alone.
            </p>

            <div className="space-y-6">
              {[
                { title: "Limited Education", desc: "Children denied their potential due to lack of resources." },
                { title: "Healthcare Gap", desc: "Treatable conditions becoming life-threatening obstacles." },
                { title: "Economic Stagnation", desc: "Communities unable to build sustainable futures." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/50 transition-colors">
                    <span className="text-amber-400 font-display text-xl">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-heading text-lg mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Side */}
          <motion.div style={{ y }} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2000&auto=format&fit=crop" 
                alt="Community struggle" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-110 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/80 to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-xl">
                  <p className="font-heading text-2xl text-white mb-2">"Every day counts when survival is the goal."</p>
                  <p className="text-amber-400 text-sm tracking-wider uppercase">— Community Voice</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
