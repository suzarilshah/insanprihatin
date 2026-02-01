'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string | null
}

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2574'

export default function Hero({
  title = 'Restoring Dignity, Rebuilding Lives',
  subtitle = 'Yayasan Insan Prihatin',
  description = 'Direct, sustainable intervention for Malaysia\'s underserved. Join a movement that turns compassion into tangible change.',
  ctaText = 'Start Your Impact',
  ctaLink = '/projects',
  backgroundImage,
}: HeroProps) {
  const bgImage = backgroundImage || DEFAULT_BACKGROUND
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 scale-110">
          <Image
            src={bgImage}
            alt="Impact Background"
            fill
            className="object-cover"
            priority
            quality={95}
            unoptimized={bgImage.startsWith('http')}
          />
        </motion.div>
        
        {/* Cinematic Gradient Overlay - Critical for Nav Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-900/40 to-foundation-pearl" />
        
        {/* Noise Texture for Film Grain Effect */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      {/* Animated Atmospheric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Main Content */}
      <motion.div style={{ y: textY, opacity }} className="relative container-wide pt-32 pb-20 z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content - Left 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-white tracking-widest uppercase shadow-sm">{subtitle}</span>
              </motion.div>

              <h1 className="heading-display text-white mb-8 leading-[1.1]">
                <span className="block">{title.split(' ').slice(0, 2).join(' ')}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-200 to-white animate-gradient-x">
                  {title.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="body-large text-white/90 mb-10 max-w-xl font-light leading-relaxed border-l-4 border-amber-400 pl-6 bg-gradient-to-r from-black/10 to-transparent py-2">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <Link href={ctaLink} className="group relative px-8 py-4 bg-teal-500 text-white rounded-full font-bold tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(42,173,173,0.5)]">
                  <span className="relative z-10 flex items-center gap-2">
                    {ctaText}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                
                <Link href="/donate" className="group px-8 py-4 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-3">
                  <span>Make a Donation</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-foundation-charcoal transition-colors">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Visual Elements - Right 5 cols */}
          <div className="lg:col-span-5 relative hidden lg:block">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
               animate={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
               className="relative z-10"
             >
                {/* Floating Glass Card 1 */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 z-20"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl max-w-[200px]">
                    <div className="text-3xl font-bold text-amber-400 mb-1">100%</div>
                    <div className="text-xs text-white/80 uppercase tracking-wider">Donation Transparency</div>
                  </div>
                </motion.div>

                {/* Floating Glass Card 2 */}
                <motion.div 
                  animate={{ y: [0, 25, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-20 -left-10 z-20"
                >
                  <div className="bg-foundation-charcoal/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl max-w-[240px]">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                       </div>
                       <div>
                         <div className="text-white font-bold">15,000+</div>
                         <div className="text-xs text-gray-400">Lives Impacted</div>
                       </div>
                     </div>
                     <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "85%" }}
                         transition={{ delay: 1.5, duration: 1.5 }}
                         className="h-full bg-gradient-to-r from-teal-400 to-sky-400" 
                       />
                     </div>
                  </div>
                </motion.div>

                {/* Central Image/Graphic */}
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <Image
                    src="https://images.unsplash.com/photo-1576267423445-807c90da1847?q=80&w=2000"
                    alt="Community Joy"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent" />
                </div>
             </motion.div>
          </div>

        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </section>
  )
}
