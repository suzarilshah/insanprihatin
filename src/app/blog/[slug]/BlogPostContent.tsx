'use client'

import { motion } from 'framer-motion'
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

interface BlogPostContentProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700',
  stories: 'bg-purple-100 text-purple-700',
  events: 'bg-rose-100 text-rose-700',
  announcements: 'bg-amber-100 text-amber-700',
}

const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2670'
const defaultAuthorImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'

// Calculate read time estimate (rough estimate: 200 words per minute)
const getReadTime = (content: string) => {
  const words = content?.split(/\s+/).length || 0
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}

export default function BlogPostContent({ post, relatedPosts }: BlogPostContentProps) {
  const tags = Array.isArray(post.tags) ? post.tags as string[] : []

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={post.featuredImage || defaultImage}
            alt={post.title}
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
            className="max-w-4xl mx-auto text-center"
          >
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 text-white/60 text-sm mb-6"
            >
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/80 truncate max-w-[200px]">{post.title}</span>
            </motion.div>

            {/* Category & Read Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-6"
            >
              {post.category && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                  {post.category}
                </span>
              )}
              <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
                {getReadTime(post.content)}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="heading-display text-white mb-6"
            >
              {post.title}
            </motion.h1>

            {post.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="body-large text-white/80 max-w-2xl mx-auto"
              >
                {post.excerpt}
              </motion.p>
            )}

            {/* Author & Date */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src={defaultAuthorImage}
                  alt="Author"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Admin</div>
                <div className="text-white/60 text-sm">
                  {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding bg-white relative">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-elevated mb-12 -mt-24"
            >
              <Image
                src={post.featuredImage || defaultImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg prose-teal max-w-none mb-12"
            >
              <div
                className="text-gray-600 leading-relaxed text-lg"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n\n/g, '</p><p class="mb-6">')
                    .replace(/\n/g, '<br />')
                    .replace(/^/, '<p class="mb-6">')
                    .replace(/$/, '</p>')
                }}
              />
            </motion.article>

            {/* Tags */}
            {tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center gap-3 mb-12 pb-12 border-b border-gray-100"
              >
                <span className="text-gray-500 font-medium">Tags:</span>
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-foundation-pearl rounded-full text-sm font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-foundation-pearl rounded-2xl mb-12"
            >
              <div>
                <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                  Enjoyed this article?
                </h3>
                <p className="text-gray-500">
                  Share it with others who might find it valuable.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
                    }
                  }}
                  className="p-3 bg-white rounded-full text-gray-600 hover:bg-teal-500 hover:text-white transition-colors shadow-sm"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
                    }
                  }}
                  className="p-3 bg-white rounded-full text-gray-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, '_blank')
                    }
                  }}
                  className="p-3 bg-white rounded-full text-gray-600 hover:bg-blue-700 hover:text-white transition-colors shadow-sm"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                  className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-800 hover:text-white transition-colors shadow-sm"
                  aria-label="Copy link"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Link href="/blog" className="btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to Blog
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section-padding bg-foundation-pearl">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-section text-foundation-charcoal mb-4">
                Related Articles
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Continue reading more stories and updates from our foundation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="block card-elegant overflow-hidden group h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={relatedPost.featuredImage || defaultImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {relatedPost.category && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${categoryColors[relatedPost.category] || 'bg-gray-100 text-gray-700'}`}>
                            {relatedPost.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 100) + '...'}
                      </p>
                      <div className="text-gray-400 text-xs">
                        {relatedPost.publishedAt ? formatDate(relatedPost.publishedAt) : formatDate(relatedPost.createdAt)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/blog" className="btn-outline">
                View All Posts
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
