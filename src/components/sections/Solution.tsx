'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { type LocalizedString, type Locale, getLocalizedValue } from '@/i18n/config'

interface Project {
  id: string
  slug: string
  title: LocalizedString | string
  description: LocalizedString | string
  featuredImage?: string | null
  category?: string | null
}

interface ImpactStat {
  id: string
  label: LocalizedString | string
  value: string
  icon?: string | null
  suffix?: LocalizedString | string | null
}

interface AboutContent {
  mission?: LocalizedString | string | null
  vision?: LocalizedString | string | null
}

interface SolutionProps {
  projects?: Project[]
  impactStats?: ImpactStat[]
  aboutContent?: AboutContent | null
  locale?: Locale
}

export default function Solution({ projects = [], impactStats = [], aboutContent, locale = 'en' }: SolutionProps) {
  // Helper to get localized value
  const l = (value: LocalizedString | string | null | undefined): string => {
    return getLocalizedValue(value as LocalizedString, locale)
  }
  return (
    <section className="section-padding bg-foundation-charcoal relative overflow-hidden text-white">
      {/* Dark Aesthetic Background */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      
      <div className="container-wide relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/10 pb-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 font-medium uppercase tracking-widest text-xs mb-4"
            >
              Our Approach
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="heading-section text-white"
            >
              Holistic Solutions for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Lasting Impact</span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/projects" className="btn-outline border-white/20 text-white hover:bg-white hover:text-foundation-charcoal">
              View All Projects
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
          
          {/* Main Feature - Large Card */}
          {projects[0] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 md:row-span-2 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[0].slug}`} className="block h-full">
                <Image
                  src={projects[0].featuredImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2000"}
                  alt={l(projects[0].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-10 max-w-2xl">
                  <div className="inline-block px-3 py-1 bg-amber-400 text-foundation-charcoal text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    {projects[0].category || 'Featured'}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-heading text-white mb-4 leading-tight">
                    {l(projects[0].title)}
                  </h3>
                  <p className="text-lg text-gray-200 line-clamp-2 mb-6 font-light">
                    {l(projects[0].description)}
                  </p>
                  <span className="inline-flex items-center text-amber-300 font-medium group-hover:translate-x-2 transition-transform">
                    Read Story <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Stats Card - Dark */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-teal-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[50px]" />
            <h4 className="text-teal-200 uppercase tracking-widest text-xs font-medium mb-2">Total Impact</h4>
            <div className="text-5xl font-display font-bold text-white mb-2">
              {impactStats[0]?.value || '15K'}{l(impactStats[0]?.suffix) || '+'}
            </div>
            <p className="text-teal-100">{l(impactStats[0]?.label) || 'Lives Changed'}</p>
          </motion.div>

          {/* Secondary Project 1 */}
          {projects[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-4 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[1].slug}`} className="block h-full">
                <Image
                  src={projects[1].featuredImage || "https://images.unsplash.com/photo-1532629345422-7515f3d16520?q=80&w=1000"}
                  alt={l(projects[1].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-teal-950/70 group-hover:bg-teal-900/60 transition-colors" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-heading text-white mb-2">{l(projects[1].title)}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2">{l(projects[1].description)}</p>
                </div>
              </Link>
            </motion.div>
          )}

           {/* Secondary Project 2 */}
           {projects[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-4 relative group rounded-3xl overflow-hidden border border-white/10"
            >
              <Link href={`/projects/${projects[2].slug}`} className="block h-full">
                <Image
                  src={projects[2].featuredImage || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000"}
                  alt={l(projects[2].title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-teal-950/70 group-hover:bg-teal-900/60 transition-colors" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-heading text-white mb-2">{l(projects[2].title)}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2">{l(projects[2].description)}</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* About/Mission Snippet */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h4 className="text-white font-heading text-xl mb-2">Our Mission</h4>
              <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">
                {l(aboutContent?.mission) || "Empowering communities through sustainable development and direct aid intervention."}
              </p>
              <Link href="/about" className="text-white text-xs font-bold uppercase tracking-wider hover:underline">Read More →</Link>
            </div>
          </motion.div>
          
        </div>

      </div>
    </section>
  )
}
