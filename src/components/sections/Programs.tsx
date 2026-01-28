'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const programs = [
  {
    id: 'education',
    title: 'Education',
    description: 'Providing scholarships, school supplies, and educational infrastructure to underprivileged students across Malaysia.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    color: 'from-sky-500 to-sky-600',
    bgColor: 'bg-sky-50',
    stats: { value: '5,000+', label: 'Students Supported' },
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Organizing medical camps, health screenings, and providing access to essential medical care for rural communities.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    stats: { value: '12,000+', label: 'Medical Consultations' },
  },
  {
    id: 'environment',
    title: 'Environment',
    description: 'Leading sustainability initiatives including tree planting, river cleaning, and environmental education programs.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    stats: { value: '50,000+', label: 'Trees Planted' },
  },
  {
    id: 'community',
    title: 'Community Development',
    description: 'Empowering local communities through skill training, microfinance initiatives, and infrastructure development.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    stats: { value: '25+', label: 'Communities Served' },
  },
]

export default function Programs() {
  return (
    <section className="section-padding bg-foundation-cream">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="accent-line" />
            <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Our Programs</span>
          </div>
          <h2 className="heading-section text-foundation-charcoal mb-6">
            Areas of Focus
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We channel our resources into four key areas that create the most significant
            and sustainable impact for communities in need.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/projects?category=${program.id}`}
                className="block card-elegant p-8 group h-full"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {program.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl font-semibold text-foundation-charcoal mb-3 group-hover:text-teal-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {program.description}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${program.bgColor}`}>
                      <span className="font-display text-lg font-bold text-foundation-charcoal">
                        {program.stats.value}
                      </span>
                      <span className="text-gray-600 text-sm">{program.stats.label}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-teal-600 font-medium text-sm">View Projects</span>
                  <svg
                    className="w-5 h-5 text-teal-600 transform group-hover:translate-x-2 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link href="/projects" className="btn-primary">
            Explore All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
