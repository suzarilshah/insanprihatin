'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteBlogPost, updateBlogPost } from '@/lib/actions/blog'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

type BlogPost = {
  id: string
  slug: string
  title: LocalizedString | string
  excerpt: LocalizedString | string | null
  category: string | null
  isPublished: boolean | null
  publishedAt: Date | null
  createdAt: Date
}

// Helper to get string value from localized field (default to English for admin)
const getTitle = (title: LocalizedString | string): string => {
  if (typeof title === 'string') return title
  return getLocalizedValue(title, 'en')
}

const getExcerpt = (excerpt: LocalizedString | string | null): string | null => {
  if (!excerpt) return null
  if (typeof excerpt === 'string') return excerpt
  return getLocalizedValue(excerpt, 'en')
}

export default function BlogPostsList({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredPosts = posts.filter(post => {
    const matchesSearch = getTitle(post.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getExcerpt(post.excerpt)?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && post.isPublished) ||
      (filter === 'draft' && !post.isPublished)
    return matchesSearch && matchesFilter
  })

  const handleTogglePublish = (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus
    startTransition(async () => {
      await updateBlogPost(id, { isPublished: newStatus })
      setPosts(posts.map(p => p.id === id ? { ...p, isPublished: newStatus } : p))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBlogPost(id)
      setPosts(posts.filter(p => p.id !== id))
      setDeleteConfirm(null)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Category</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <Link href={`/admin/dashboard/blog/${post.id}`} className="block">
                      <span className="font-medium text-foundation-charcoal hover:text-teal-600 line-clamp-1">
                        {getTitle(post.title)}
                      </span>
                      {getExcerpt(post.excerpt) && (
                        <span className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {getExcerpt(post.excerpt)}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {post.category ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {post.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.isPublished)}
                      disabled={isPending}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        post.isPublished
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {post.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell">
                    {new Date(post.createdAt).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/dashboard/blog/${post.id}`}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found</p>
          <Link href="/admin/dashboard/blog/new" className="text-teal-600 font-medium mt-2 inline-block hover:text-teal-700">
            Create your first post
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                Delete Post?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone. The post will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
