'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getBlogPost, createBlogPost, updateBlogPost } from '@/lib/actions/blog'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BlogPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!isNew)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (!isNew) {
      async function loadPost() {
        try {
          // Get by ID using a different approach
          const response = await fetch(`/api/blog/${resolvedParams.id}`)
          if (response.ok) {
            const post = await response.json()
            if (post) {
              setFormData({
                title: post.title || '',
                slug: post.slug || '',
                excerpt: post.excerpt || '',
                content: post.content || '',
                featuredImage: post.featuredImage || '',
                category: post.category || '',
                tags: (post.tags as string[]) || [],
                metaTitle: post.metaTitle || '',
                metaDescription: post.metaDescription || '',
                isPublished: post.isPublished || false,
              })
            }
          }
        } catch (error) {
          console.error('Failed to load post:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadPost()
    }
  }, [isNew, resolvedParams.id])

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: isNew ? generateSlug(title) : formData.slug,
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  const handleSave = (publish?: boolean) => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'Slug is required' })
      return
    }
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Content is required' })
      return
    }

    setMessage(null)
    startTransition(async () => {
      try {
        const data = {
          ...formData,
          isPublished: publish !== undefined ? publish : formData.isPublished,
        }

        if (isNew) {
          const result = await createBlogPost(data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Post created successfully!' })
            router.push('/admin/dashboard/blog')
          }
        } else {
          const result = await updateBlogPost(resolvedParams.id, data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Post updated successfully!' })
            if (publish !== undefined) {
              setFormData({ ...formData, isPublished: publish })
            }
          }
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save post. Please try again.' })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/dashboard/blog" className="hover:text-teal-600">Blog</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">{isNew ? 'New Post' : 'Edit'}</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            {isNew ? 'Create New Post' : 'Edit Post'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && formData.slug && (
            <Link
              href={`/blog/${formData.slug}`}
              target="_blank"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview
            </Link>
          )}
          <button
            onClick={() => handleSave()}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? 'Saving...' : formData.isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-lg"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="post-url-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  placeholder="Brief description for previews..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none font-mono text-sm"
                  placeholder="Write your content here... (Markdown supported)"
                />
                <p className="text-xs text-gray-500 mt-1">Supports Markdown formatting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.isPublished
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {formData.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Featured Image</h3>
            <input
              type="text"
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="Image URL"
            />
            {formData.featuredImage && (
              <div className="mt-3 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Category</h3>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">Select category</option>
              <option value="news">News</option>
              <option value="updates">Updates</option>
              <option value="stories">Impact Stories</option>
              <option value="events">Events</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Tags</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-teal-900"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="SEO title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                  placeholder="SEO description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
