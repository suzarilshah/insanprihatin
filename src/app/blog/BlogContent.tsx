'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'All Posts', icon: '📰', count: 6 },
  { id: 'news', name: 'News', icon: '📢', count: 2 },
  { id: 'stories', name: 'Impact Stories', icon: '💫', count: 2 },
  { id: 'events', name: 'Events', icon: '🎉', count: 1 },
  { id: 'announcements', name: 'Announcements', icon: '📣', count: 1 },
]

const samplePosts = [
  {
    id: '1',
    slug: 'annual-report-2025',
    title: 'Yayasan Insan Prihatin Releases 2025 Annual Report',
    excerpt: 'Our comprehensive report showcases the remarkable impact achieved across all programs, with over RM 15 million deployed to communities in need.',
    category: 'announcements',
    author: 'Admin',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2026-01-15',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670',
    readTime: '5 min',
    featured: true,
  },
  {
    id: '2',
    slug: 'scholarship-recipients-success',
    title: 'From Struggle to Success: How Scholarships Changed Their Lives',
    excerpt: 'Meet three scholarship recipients who have overcome adversity to achieve academic excellence and are now giving back to their communities.',
    category: 'stories',
    author: 'Communications Team',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2026-01-10',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670',
    readTime: '8 min',
  },
  {
    id: '3',
    slug: 'medical-camp-sabah',
    title: 'Medical Camp Reaches 1,000 Villagers in Rural Sabah',
    excerpt: 'Our mobile health unit successfully provided free medical consultations and treatments to underserved communities in remote areas.',
    category: 'news',
    author: 'Healthcare Program',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2026-01-05',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2670',
    readTime: '4 min',
  },
  {
    id: '4',
    slug: 'charity-gala-2026',
    title: 'Annual Charity Gala 2026: Save the Date',
    excerpt: 'Join us for an evening of celebration and giving at our upcoming charity gala. Tickets now available for this prestigious event.',
    category: 'events',
    author: 'Events Team',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2025-12-28',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670',
    readTime: '3 min',
  },
  {
    id: '5',
    slug: 'tree-planting-milestone',
    title: '50,000 Trees Planted: A Green Milestone',
    excerpt: 'We celebrate a significant environmental achievement as our Green Malaysia Initiative reaches the 50,000 trees planted milestone.',
    category: 'news',
    author: 'Environment Program',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2025-12-20',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2670',
    readTime: '4 min',
  },
  {
    id: '6',
    slug: 'volunteer-appreciation',
    title: 'Celebrating Our Volunteers: The Heart of Our Mission',
    excerpt: 'A tribute to the dedicated volunteers who selflessly contribute their time and skills to our various programs across Malaysia.',
    category: 'stories',
    author: 'Volunteer Coordination',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2025-12-15',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2574',
    readTime: '6 min',
  },
]

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700',
  stories: 'bg-purple-100 text-purple-700',
  events: 'bg-rose-100 text-rose-700',
  announcements: 'bg-amber-100 text-amber-700',
}

export default function BlogContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPosts = activeCategory === 'all'
    ? samplePosts
    : samplePosts.filter((p) => p.category === activeCategory)

  const featuredPost = samplePosts.find((p) => p.featured) || samplePosts[0]
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost.id)

  return (
    <div>
      {/* Premium Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2670"
            alt="News and stories"
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
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="badge-premium bg-white/10 text-white/90 mx-auto mb-8"
            >
              <span className="accent-dot" />
              <span className="text-sm font-medium tracking-wide">Blog & News</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Stories of
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gradient-amber"
              >
                Impact
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80"
            >
              Stay updated with the latest news, impact stories, and events from
              Yayasan Insan Prihatin.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post Section */}
      <section className="relative -mt-16 z-20 pb-16">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block card-elegant overflow-hidden group"
            >
              <div className="grid lg:grid-cols-2 min-h-[400px]">
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/40 via-transparent to-transparent lg:bg-gradient-to-r" />
                  <div className="absolute top-6 left-6">
                    <span className="badge-premium bg-amber-400 text-foundation-charcoal">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-sm font-semibold">Featured</span>
                    </span>
                  </div>
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoryColors[featuredPost.category] || 'bg-gray-100 text-gray-700'}`}>
                      {featuredPost.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">{featuredPost.readTime} read</span>
                  </div>

                  <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foundation-charcoal mb-4 group-hover:text-teal-600 transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={featuredPost.authorImage}
                          alt={featuredPost.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-foundation-charcoal text-sm">
                          {featuredPost.author}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(featuredPost.publishedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Read Article
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="section-padding bg-foundation-pearl relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[150px]" />

        <div className="relative container-wide">
          {/* Category Filter - Premium Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {categories.map((category, i) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-elevated'
                    : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 shadow-sm border border-gray-100'
                }`}
              >
                <span className="text-base">{category.icon}</span>
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

          {/* Posts Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  layout
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block card-elegant overflow-hidden group h-full"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Category badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                          {post.category}
                        </span>
                      </div>

                      {/* Read time */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700">
                          {post.readTime} read
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-5 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Author & Date */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-foundation-charcoal">
                              {post.author}
                            </div>
                            <div className="text-gray-400">
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-teal-600 font-medium text-sm group-hover:gap-2 transition-all">
                          Read
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
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
              Load More Articles
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="relative card-elegant overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574"
                alt="Newsletter"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-teal-900/80" />
            </div>

            <div className="relative py-16 px-8 lg:px-16 z-10">
              <div className="max-w-2xl mx-auto text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-block text-5xl mb-4"
                >
                  📬
                </motion.span>

                <h2 className="heading-subsection text-white mb-4">
                  Subscribe to Our Newsletter
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  Get the latest stories, news, and updates delivered straight to your inbox.
                </p>

                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button type="submit" className="btn-secondary whitespace-nowrap">
                    Subscribe
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>

                <p className="text-white/50 text-sm mt-4">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
