'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'All Posts' },
  { id: 'news', name: 'News' },
  { id: 'stories', name: 'Impact Stories' },
  { id: 'events', name: 'Events' },
  { id: 'announcements', name: 'Announcements' },
]

const samplePosts = [
  {
    id: '1',
    slug: 'annual-report-2025',
    title: 'Yayasan Insan Prihatin Releases 2025 Annual Report',
    excerpt: 'Our comprehensive report showcases the remarkable impact achieved across all programs, with over RM 15 million deployed to communities in need.',
    category: 'announcements',
    author: 'Admin',
    publishedAt: '2026-01-15',
    image: '/images/logo-light.png',
  },
  {
    id: '2',
    slug: 'scholarship-recipients-success',
    title: 'From Struggle to Success: How Scholarships Changed Their Lives',
    excerpt: 'Meet three scholarship recipients who have overcome adversity to achieve academic excellence and are now giving back to their communities.',
    category: 'stories',
    author: 'Communications Team',
    publishedAt: '2026-01-10',
    image: '/images/logo-light.png',
  },
  {
    id: '3',
    slug: 'medical-camp-sabah',
    title: 'Medical Camp Reaches 1,000 Villagers in Rural Sabah',
    excerpt: 'Our mobile health unit successfully provided free medical consultations and treatments to underserved communities in remote areas.',
    category: 'news',
    author: 'Healthcare Program',
    publishedAt: '2026-01-05',
    image: '/images/logo-light.png',
  },
  {
    id: '4',
    slug: 'charity-gala-2026',
    title: 'Annual Charity Gala 2026: Save the Date',
    excerpt: 'Join us for an evening of celebration and giving at our upcoming charity gala. Tickets now available for this prestigious event.',
    category: 'events',
    author: 'Events Team',
    publishedAt: '2025-12-28',
    image: '/images/logo-light.png',
  },
  {
    id: '5',
    slug: 'tree-planting-milestone',
    title: '50,000 Trees Planted: A Green Milestone',
    excerpt: 'We celebrate a significant environmental achievement as our Green Malaysia Initiative reaches the 50,000 trees planted milestone.',
    category: 'news',
    author: 'Environment Program',
    publishedAt: '2025-12-20',
    image: '/images/logo-light.png',
  },
  {
    id: '6',
    slug: 'volunteer-appreciation',
    title: 'Celebrating Our Volunteers: The Heart of Our Mission',
    excerpt: 'A tribute to the dedicated volunteers who selflessly contribute their time and skills to our various programs across Malaysia.',
    category: 'stories',
    author: 'Volunteer Coordination',
    publishedAt: '2025-12-15',
    image: '/images/logo-light.png',
  },
]

export default function BlogContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPosts = activeCategory === 'all'
    ? samplePosts
    : samplePosts.filter((p) => p.category === activeCategory)

  const featuredPost = samplePosts[0]
  const regularPosts = filteredPosts.slice(1)

  return (
    <div className="section-padding bg-white">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="accent-line" />
            <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Blog & News</span>
          </div>
          <h1 className="heading-display text-foundation-charcoal mb-6">
            Stories of Impact
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, impact stories, and events from
            Yayasan Insan Prihatin.
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block card-elegant overflow-hidden group"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto bg-gradient-to-br from-teal-100 to-teal-200">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-contain p-12 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 capitalize">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="text-teal-600 text-sm font-medium mb-3 capitalize">
                  {featuredPost.category}
                </div>
                <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-foundation-charcoal mb-4 group-hover:text-teal-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{featuredPost.author}</span>
                  <span>•</span>
                  <span>{formatDate(featuredPost.publishedAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              layout
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block card-elegant overflow-hidden group h-full"
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-teal-50 to-sky-50 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-teal-600 text-xs font-medium uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
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
            Load More Posts
          </button>
        </motion.div>
      </div>
    </div>
  )
}
