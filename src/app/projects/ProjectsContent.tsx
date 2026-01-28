'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { id: 'all', name: 'All Projects' },
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community' },
]

const sampleProjects = [
  {
    id: '1',
    slug: 'scholarship-program-2024',
    title: 'Scholarship Program 2024',
    subtitle: 'Empowering Future Leaders',
    description: 'Providing full scholarships to 500 underprivileged students pursuing higher education.',
    category: 'education',
    status: 'ongoing',
    beneficiaries: 500,
    location: 'Nationwide',
    image: '/images/logo-light.png',
  },
  {
    id: '2',
    slug: 'rural-health-camps',
    title: 'Rural Health Camps',
    subtitle: 'Healthcare for All',
    description: 'Mobile medical camps bringing healthcare services to remote communities.',
    category: 'healthcare',
    status: 'ongoing',
    beneficiaries: 3000,
    location: 'Sabah & Sarawak',
    image: '/images/logo-light.png',
  },
  {
    id: '3',
    slug: 'green-malaysia-initiative',
    title: 'Green Malaysia Initiative',
    subtitle: 'Planting for Tomorrow',
    description: 'Community-driven tree planting and environmental conservation program.',
    category: 'environment',
    status: 'completed',
    beneficiaries: 10000,
    location: 'Peninsular Malaysia',
    image: '/images/logo-light.png',
  },
  {
    id: '4',
    slug: 'skills-training-center',
    title: 'Skills Training Center',
    subtitle: 'Building Livelihoods',
    description: 'Vocational training programs for unemployed youth and single mothers.',
    category: 'community',
    status: 'ongoing',
    beneficiaries: 200,
    location: 'Kuala Lumpur',
    image: '/images/logo-light.png',
  },
  {
    id: '5',
    slug: 'school-renovation-project',
    title: 'School Renovation Project',
    subtitle: 'Better Learning Spaces',
    description: 'Renovating and upgrading rural schools to provide better learning environments.',
    category: 'education',
    status: 'completed',
    beneficiaries: 1500,
    location: 'Kelantan',
    image: '/images/logo-light.png',
  },
  {
    id: '6',
    slug: 'clean-water-initiative',
    title: 'Clean Water Initiative',
    subtitle: 'Access to Safe Water',
    description: 'Installing water filtration systems in communities without access to clean water.',
    category: 'community',
    status: 'ongoing',
    beneficiaries: 5000,
    location: 'Orang Asli Villages',
    image: '/images/logo-light.png',
  },
]

const statusColors: Record<string, string> = {
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  upcoming: 'bg-amber-100 text-amber-700',
}

export default function ProjectsContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProjects = activeCategory === 'all'
    ? sampleProjects
    : sampleProjects.filter((p) => p.category === activeCategory)

  return (
    <div className="section-padding bg-foundation-pearl">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="accent-line" />
            <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Our Work</span>
          </div>
          <h1 className="heading-display text-foundation-charcoal mb-6">
            Projects & Initiatives
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our ongoing and completed projects that are creating lasting impact
            across communities in Malaysia.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-teal-500 text-white shadow-glow-teal'
                  : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Link
                href={`/projects/${project.slug}`}
                className="block card-elegant overflow-hidden group h-full"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-teal-100 to-teal-200 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-teal-600 text-sm font-medium mb-2 capitalize">
                    {project.category}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {project.beneficiaries.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {project.location}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button className="btn-outline">
            Load More Projects
          </button>
        </motion.div>
      </div>
    </div>
  )
}
