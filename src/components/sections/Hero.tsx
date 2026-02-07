'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

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
  // Delay heavy animations until after initial render for better LCP
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Small delay to allow LCP to complete before heavy animations
    const timer = setTimeout(() => setIsHydrated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-[90vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ scale: isHydrated ? heroScale : 1 }} className="absolute inset-0">
          <Image
            src={bgImage}
            alt="Impact Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={80}
            fetchPriority="high"
          />
        </motion.div>

        {/* Cinematic Gradient Overlay - Critical for Nav Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/90 via-teal-900/70 to-teal-900/40" />

        {/* Noise Texture for Film Grain Effect - Deferred */}
        {isHydrated && (
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        )}
      </div>

      {/* Animated Atmospheric Elements - Deferred for better LCP */}
      {isHydrated && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-teal-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-amber-500/10 rounded-full blur-[100px]"
          />
        </div>
      )}

      {/* Main Content */}
      <motion.div
        style={{ opacity: isHydrated ? heroOpacity : 1 }}
        className="relative container-wide pt-24 md:pt-32 pb-16 md:pb-20 z-10"
      >
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* Text Content - Left 7 cols */}
          <div className="lg:col-span-7">
            <div>
              {/* Premium Badge with Official Slogan */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] md:text-xs font-medium text-white tracking-widest uppercase shadow-sm">{subtitle}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-amber-400/20 border border-amber-400/30 backdrop-blur-md">
                  <span className="text-xs md:text-sm font-display font-bold text-amber-300 italic">&ldquo;Ini Rumah Kita&rdquo;</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white mb-6 md:mb-8 leading-[1.1] drop-shadow-lg">
                <span className="block">{title.split(' ').slice(0, 2).join(' ')}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-200 to-white">
                  {title.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-white/95 mb-8 md:mb-10 max-w-xl font-light leading-relaxed border-l-4 border-amber-400 pl-4 md:pl-6 bg-black/20 backdrop-blur-sm py-3 md:py-4 pr-4 md:pr-6 rounded-r-2xl drop-shadow-md">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-5">
                <Link href={ctaLink} className="group relative px-6 md:px-8 py-3 md:py-4 bg-teal-500 text-white rounded-full font-bold tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(42,173,173,0.5)] text-center sm:text-left">
                  <span className="relative z-10 flex items-center justify-center sm:justify-start gap-2">
                    {ctaText}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <Link href="/donate" className="group px-6 md:px-8 py-3 md:py-4 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center sm:justify-start gap-3">
                  <span>Make a Donation</span>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-foundation-charcoal transition-colors">
                     <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Elements - Right 5 cols (Hidden on mobile for better performance) */}
          <div className="lg:col-span-5 relative hidden lg:block">
            {isHydrated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                {/* Floating Glass Card 1 */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 z-20"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl max-w-[180px] md:max-w-[200px]">
                    <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-1">100%</div>
                    <div className="text-[10px] md:text-xs text-white/80 uppercase tracking-wider">Donation Transparency</div>
                  </div>
                </motion.div>

                {/* Floating Glass Card 2 */}
                <motion.div
                  animate={{ y: [0, 25, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-20 -left-10 z-20"
                >
                  <div className="bg-foundation-charcoal/80 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl shadow-2xl max-w-[200px] md:max-w-[240px]">
                     <div className="flex items-center gap-2 md:gap-3 mb-3">
                       <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300">
                         <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                       </div>
                       <div>
                         <div className="text-white font-bold text-sm md:text-base">15,000+</div>
                         <div className="text-[10px] md:text-xs text-gray-400">Lives Impacted</div>
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

                {/* Central Image/Graphic - Lazy loaded */}
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <Image
                    src="https://images.unsplash.com/photo-1617450365226-9bf28c5d3575?q=80&w=1200"
                    alt="Community Joy"
                    fill
                    sizes="(max-width: 1024px) 0vw, 40vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent" />
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on mobile */}
      {isHydrated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 hidden md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </motion.div>
      )}
    </section>
  )
}
