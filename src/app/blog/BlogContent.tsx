'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  authorId: string | null
  category: string | null
  tags: unknown
  isPublished: boolean | null
  publishedAt: Date | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: Date
  updatedAt: Date
}

interface BlogContentProps {
  posts: BlogPost[]
}

const defaultCategories = [
  { id: 'all', name: 'All Posts', icon: '📰' },
  { id: 'news', name: 'News', icon: '📢' },
  { id: 'stories', name: 'Impact Stories', icon: '💫' },
  { id: 'events', name: 'Events', icon: '🎉' },
  { id: 'announcements', name: 'Announcements', icon: '📣' },
]

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700',
  stories: 'bg-purple-100 text-purple-700',
  events: 'bg-rose-100 text-rose-700',
  announcements: 'bg-amber-100 text-amber-700',
}

const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2670'
const defaultAuthorImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'

export default function BlogContent({ posts }: BlogContentProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Get unique categories from posts and merge with defaults
  const postCategories = [...new Set(posts.map(p => p.category).filter(Boolean))]
  const categories = defaultCategories.map(cat => ({
    ...cat,
    count: cat.id === 'all'
      ? posts.length
      : posts.filter(p => p.category === cat.id).length
  })).filter(cat => cat.id === 'all' || cat.count > 0 || postCategories.includes(cat.id))

  // Add any custom categories from posts that aren't in defaults
  postCategories.forEach(cat => {
    if (cat && !defaultCategories.find(d => d.id === cat)) {
      categories.push({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: '📁',
        count: posts.filter(p => p.category === cat).length
      })
    }
  })

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  // Use most recent post as featured, or first post
  const featuredPost = posts[0]
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id)

  // Calculate read time estimate (rough estimate: 200 words per minute)
  const getReadTime = (content: string) => {
    const words = content?.split(/\s+/).length || 0
    const minutes = Math.ceil(words / 200)
    return `${minutes} min`
  }

  return (
    <div>
      {/* Premium Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2670"
            alt="News and stories"
            fill
            className="object-cover"
            priority
          />
          {/* Nav-Safe Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-foundation-charcoal/90 via-foundation-charcoal/60 to-foundation-pearl" />
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="grain" />
        </div>

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[100px]"
        />

        <div className="relative container-wide z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-white uppercase">The Journal</span>
            </motion.div>

            <h1 className="heading-display text-white mb-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Chronicles of
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 animate-gradient-x"
              >
                Transformation
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="body-large text-white/80 max-w-2xl mx-auto"
            >
              Voices from the ground, updates on our progress, and stories of the growing
              impact we are building together. This is where our journey finds its narrative.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post Section */}
      {featuredPost && (
        <section className="relative -mt-32 z-20 pb-16">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="block bg-white rounded-[2rem] overflow-hidden shadow-2xl group border border-gray-100"
              >
                <div className="grid lg:grid-cols-2 min-h-[500px]">
                  <div className="relative overflow-hidden h-[300px] lg:h-auto">
                    <Image
                      src={featuredPost.featuredImage || defaultImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/40 via-transparent to-transparent lg:bg-gradient-to-r" />
                    <div className="absolute top-6 left-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-foundation-charcoal border border-amber-300 shadow-md">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wide">Editor's Pick</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-8 lg:p-16 flex flex-col justify-center bg-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg className="w-64 h-64 text-foundation-charcoal" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />
                      </svg>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        {featuredPost.category && (
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColors[featuredPost.category] || 'bg-gray-100 text-gray-700'}`}>
                            {featuredPost.category}
                          </span>
                        )}
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 text-sm font-medium">{getReadTime(featuredPost.content)} read</span>
                      </div>

                      <h2 className="font-display text-3xl lg:text-5xl font-bold text-foundation-charcoal mb-6 group-hover:text-teal-600 transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>

                      <p className="text-gray-600 text-lg mb-8 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt || featuredPost.content.substring(0, 250) + '...'}
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <Image
                              src={defaultAuthorImage}
                              alt="Author"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-foundation-charcoal text-sm">
                              Yayasan Team
                            </div>
                            <div className="text-gray-500 text-xs">
                              {featuredPost.publishedAt ? formatDate(featuredPost.publishedAt) : formatDate(featuredPost.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-teal-600 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                          Read Story
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      <section className="section-padding bg-foundation-pearl relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[150px]" />

        <div className="relative container-wide">
          <div className="text-center mb-16">
             <h2 className="heading-section text-foundation-charcoal mb-4">
               Latest <span className="text-teal-600 italic font-serif">Updates</span>
             </h2>
          </div>

          {/* Category Filter - Premium Pills */}
          {categories.length > 1 && (
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
                      ? 'bg-foundation-charcoal text-white shadow-lg'
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
          )}

          {/* Posts Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {regularPosts.length > 0 ? (
                regularPosts.map((post, index) => (
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
                      className="block bg-white rounded-3xl overflow-hidden group h-full flex flex-col shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.featuredImage || defaultImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foundation-charcoal/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Category badge */}
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                              {post.category}
                            </span>
                          </div>
                        )}

                        {/* Read time */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700">
                            {getReadTime(post.content)} read
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="font-heading text-xl font-bold text-foundation-charcoal mb-3 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>

                        <p className="text-gray-500 text-sm mb-5 line-clamp-3 flex-grow leading-relaxed">
                          {post.excerpt || post.content.substring(0, 150) + '...'}
                        </p>

                        {/* Author & Date */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100">
                              <Image
                                src={defaultAuthorImage}
                                alt="Author"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-xs">
                              <div className="font-bold text-foundation-charcoal">
                                Team
                              </div>
                              <div className="text-gray-400">
                                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-teal-600 font-bold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
                            Read
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : posts.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                    No Blog Posts Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    We&apos;re working on great content. Check back soon!
                  </p>
                  <Link href="/contact" className="btn-primary">
                    Stay in Touch
                  </Link>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-wide">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574"
                alt="Newsletter"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-teal-900/80" />
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>

            <div className="relative py-20 px-8 lg:px-16 z-10">
              <div className="max-w-2xl mx-auto text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-block text-6xl mb-6"
                >
                  📬
                </motion.span>

                <h2 className="heading-subsection text-white mb-4">
                  Join Our Community of Changemakers
                </h2>
                <p className="text-white/80 text-lg mb-10">
                  Get exclusive updates on our projects, inspiring stories from the field, 
                  and invitations to upcoming events.
                </p>

                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                  <button type="submit" className="btn-secondary whitespace-nowrap shadow-lg hover:shadow-glow-amber">
                    Subscribe Now
                  </button>
                </form>

                <p className="text-white/40 text-xs mt-6">
                  We respect your inbox. Zero spam, just impact. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
