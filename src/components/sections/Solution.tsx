'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  featuredImage?: string | null
  category?: string | null
}

interface ImpactStat {
  id: string
  label: string
  value: string
  icon?: string | null
  suffix?: string | null
}

interface AboutContent {
  mission?: string | null
  vision?: string | null
}

interface SolutionProps {
  projects?: Project[]
  impactStats?: ImpactStat[]
  aboutContent?: AboutContent | null
}

export default function Solution({ projects = [], impactStats = [], aboutContent }: SolutionProps) {
  return (
    <section className="section-padding bg-foundation-pearl relative overflow-hidden">
      {/* Decorative Mesh */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container-wide relative z-10">
        
        {/* Header Section: Mission Context */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="accent-line" />
            <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Our Solution</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-foundation-charcoal mb-8"
          >
            Holistic Community <br />
            <span className="text-gradient">Development</span>
          </motion.h2>

          {aboutContent?.mission && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="body-large text-gray-600"
            >
              {aboutContent.mission}
            </motion.p>
          )}
        </div>

        {/* Impact Stats Grid - Trust Indicators */}
        {impactStats && impactStats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
          >
            {impactStats.map((stat, i) => (
              <div key={stat.id} className="card-elegant p-8 text-center hover-lift">
                <div className="font-display text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-500 font-medium uppercase tracking-wide text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Projects Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
          {/* Main Feature (Large) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 card-elegant group relative overflow-hidden"
          >
            {projects[0] && (
              <Link href={`/projects/${projects[0].slug}`} className="block h-full">
                <div className="absolute inset-0">
                  <Image
                    src={projects[0].featuredImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000"}
                    alt={projects[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/90 via-foundation-charcoal/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                  <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-foundation-charcoal text-xs font-bold uppercase tracking-wider mb-4">
                    Featured Project
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                    {projects[0].title}
                  </h3>
                  <p className="text-gray-200 line-clamp-2 max-w-lg mb-6">
                    {projects[0].description}
                  </p>
                  <span className="btn-primary bg-white text-teal-900 border-none">
                    View Impact
                  </span>
                </div>
              </Link>
            )}
          </motion.div>

          {/* Secondary Features (Stacked) */}
          <div className="space-y-8 flex flex-col h-full">
            {projects.slice(1, 3).map((project, i) => (
               <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex-1 card-elegant group relative overflow-hidden"
              >
                <Link href={`/projects/${project.slug}`} className="block h-full">
                  <div className="absolute inset-0">
                    <Image
                      src={project.featuredImage || `https://images.unsplash.com/photo-${i === 0 ? '1509099836130-7bd59aa27f3b' : '1532629345422-7515f3d16520'}?q=80&w=1000`}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/90 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                      {project.category || 'Initiative'}
                    </span>
                    <h3 className="font-heading text-xl text-white mb-2">
                      {project.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* View All Link Card */}
            {projects.length < 3 && (
               <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 card-elegant bg-teal-900 flex items-center justify-center group cursor-pointer"
              >
                <Link href="/projects" className="text-center p-8">
                  <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-white font-heading text-xl">View All Projects</h3>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
