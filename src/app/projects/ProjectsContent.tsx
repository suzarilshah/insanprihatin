'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { id: 'all', name: 'All Projects', icon: '🎯', count: 6 },
  { id: 'education', name: 'Education', icon: '🎓', count: 2 },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: 1 },
  { id: 'environment', name: 'Environment', icon: '🌳', count: 1 },
  { id: 'community', name: 'Community', icon: '🏘️', count: 2 },
]

const sampleProjects = [
  {
    id: '1',
    slug: 'scholarship-program-2024',
    title: 'Scholarship Program 2024',
    subtitle: 'Empowering Future Leaders',
    description: 'Providing full scholarships to 500 underprivileged students pursuing higher education across Malaysian universities.',
    category: 'education',
    status: 'ongoing',
    beneficiaries: 500,
    location: 'Nationwide',
    raised: 850000,
    goal: 1000000,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670',
  },
  {
    id: '2',
    slug: 'rural-health-camps',
    title: 'Rural Health Camps',
    subtitle: 'Healthcare for All',
    description: 'Mobile medical camps bringing healthcare services to remote communities in East Malaysia with free consultations and medicine.',
    category: 'healthcare',
    status: 'ongoing',
    beneficiaries: 3000,
    location: 'Sabah & Sarawak',
    raised: 420000,
    goal: 500000,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2670',
  },
  {
    id: '3',
    slug: 'green-malaysia-initiative',
    title: 'Green Malaysia Initiative',
    subtitle: 'Planting for Tomorrow',
    description: 'Community-driven tree planting and environmental conservation program targeting 100,000 trees across Peninsular Malaysia.',
    category: 'environment',
    status: 'completed',
    beneficiaries: 10000,
    location: 'Peninsular Malaysia',
    raised: 300000,
    goal: 300000,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2613',
  },
  {
    id: '4',
    slug: 'skills-training-center',
    title: 'Skills Training Center',
    subtitle: 'Building Livelihoods',
    description: 'Vocational training programs for unemployed youth and single mothers, equipping them with marketable skills.',
    category: 'community',
    status: 'ongoing',
    beneficiaries: 200,
    location: 'Kuala Lumpur',
    raised: 180000,
    goal: 250000,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670',
  },
  {
    id: '5',
    slug: 'school-renovation-project',
    title: 'School Renovation Project',
    subtitle: 'Better Learning Spaces',
    description: 'Renovating and upgrading rural schools to provide better learning environments for underprivileged children.',
    category: 'education',
    status: 'completed',
    beneficiaries: 1500,
    location: 'Kelantan',
    raised: 500000,
    goal: 500000,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2574',
  },
  {
    id: '6',
    slug: 'clean-water-initiative',
    title: 'Clean Water Initiative',
    subtitle: 'Access to Safe Water',
    description: 'Installing water filtration systems in Orang Asli communities without access to clean and safe drinking water.',
    category: 'community',
    status: 'ongoing',
    beneficiaries: 5000,
    location: 'Orang Asli Villages',
    raised: 320000,
    goal: 400000,
    image: 'https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?q=80&w=2574',
  },
]

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  upcoming: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
}

export default function ProjectsContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProjects = activeCategory === 'all'
    ? sampleProjects
    : sampleProjects.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Premium Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670"
            alt="Community project"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-sky-900/85" />
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="grain" />
        </div>

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[100px]"
        />

        <div className="relative container-wide z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="badge-premium bg-white/10 text-white/90 mb-8"
            >
              <span className="accent-dot" />
              <span className="text-sm font-medium tracking-wide">Our Work</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Projects &
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gradient-amber"
              >
                Initiatives
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80 max-w-2xl"
            >
              Explore our ongoing and completed projects that are creating lasting impact
              across communities in Malaysia.
            </motion.p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12"
          >
            <div className="card-glass-dark inline-flex gap-8 md:gap-12 p-6">
              {[
                { value: '120+', label: 'Total Projects' },
                { value: '50K+', label: 'Beneficiaries' },
                { value: '13', label: 'States Covered' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-2xl lg:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section-padding bg-foundation-pearl relative">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[150px]" />

        <div className="relative container-wide">
          {/* Category Filter - Premium Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {categories.map((category, i) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-medium transition-all duration-400 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-elevated'
                    : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 shadow-sm border border-gray-100'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project, index) => {
                const progress = Math.round((project.raised / project.goal) * 100)
                const status = statusConfig[project.status]

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    layout
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      className="block card-elegant overflow-hidden group h-full"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Status badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                            {project.status}
                          </span>
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 capitalize">
                            {project.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-teal-600 text-sm font-semibold capitalize">
                            {project.category}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-gray-400 text-sm">{project.location}</span>
                        </div>

                        <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                          {project.title}
                        </h3>

                        <p className="text-gray-500 text-sm mb-5 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-foundation-charcoal">
                              RM {(project.raised / 1000).toFixed(0)}K raised
                            </span>
                            <span className="text-gray-400">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                              className={`h-full rounded-full ${
                                progress >= 100
                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                  : 'bg-gradient-to-r from-teal-400 to-teal-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">{project.beneficiaries.toLocaleString()}</span>
                            <span className="text-gray-400">beneficiaries</span>
                          </div>

                          <div className="flex items-center gap-1 text-teal-600 font-medium text-sm group-hover:gap-2 transition-all">
                            Learn more
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <button className="btn-primary">
              Load More Projects
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Impact CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="relative card-elegant overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2670"
                alt="Volunteers"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-teal-900/80" />
            </div>

            <div className="relative py-16 px-8 lg:px-16 z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block text-5xl mb-4"
                  >
                    🚀
                  </motion.span>

                  <h2 className="heading-subsection text-white mb-4">
                    Want to Support Our Projects?
                  </h2>
                  <p className="text-white/80 text-lg mb-8">
                    Your contribution can help us reach more communities and create lasting change.
                    Every ringgit makes a difference.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/donate" className="btn-secondary">
                      Make a Donation
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      href="/contact"
                      className="btn-outline border-white/40 text-white hover:bg-white hover:text-teal-700"
                    >
                      Partner With Us
                    </Link>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'RM 2.5M', label: 'Raised This Year' },
                      { value: '25+', label: 'Corporate Partners' },
                      { value: '1,200+', label: 'Monthly Donors' },
                      { value: '100%', label: 'Transparent' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card-glass-dark p-6 text-center"
                      >
                        <div className="font-display text-2xl font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-white/60 text-sm">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
