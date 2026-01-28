'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const contentSections = [
  {
    id: 'hero',
    title: 'Hero Section',
    description: 'Main banner content on homepage',
    icon: '🎯',
    lastUpdated: '2 days ago',
  },
  {
    id: 'about',
    title: 'About Section',
    description: 'Mission, vision, and values',
    icon: '📖',
    lastUpdated: '1 week ago',
  },
  {
    id: 'impact',
    title: 'Impact Statistics',
    description: 'Numbers and metrics displayed',
    icon: '📊',
    lastUpdated: '3 days ago',
  },
  {
    id: 'programs',
    title: 'Programs Overview',
    description: 'Program descriptions and categories',
    icon: '🎯',
    lastUpdated: '5 days ago',
  },
  {
    id: 'cta',
    title: 'Call to Action',
    description: 'Donation and volunteer prompts',
    icon: '💪',
    lastUpdated: '1 week ago',
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Address, phone, and email',
    icon: '📍',
    lastUpdated: '2 weeks ago',
  },
  {
    id: 'footer',
    title: 'Footer Content',
    description: 'Links and social media',
    icon: '🔗',
    lastUpdated: '1 month ago',
  },
  {
    id: 'seo',
    title: 'SEO Settings',
    description: 'Meta titles and descriptions',
    icon: '🔍',
    lastUpdated: '3 days ago',
  },
]

export default function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = contentSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the same sidebar from dashboard - simplified here */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
              <span>/</span>
              <span className="text-foundation-charcoal">Site Content</span>
            </div>
            <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
              Manage Site Content
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Content Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/dashboard/content/${section.id}`}
                className="block admin-card p-6 hover:border-teal-200 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-4">{section.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{section.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Updated {section.lastUpdated}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                Content Management Tips
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Changes made here will be reflected on the live website immediately.
                Always preview your changes before publishing. Use the preview button
                to see how content will appear to visitors.
              </p>
              <a href="#" className="text-teal-600 font-medium text-sm hover:text-teal-700">
                View documentation →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
