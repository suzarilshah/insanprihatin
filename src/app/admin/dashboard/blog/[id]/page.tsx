'use client'

import { useState, useEffect, useTransition, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBlogPost, updateBlogPost } from '@/lib/actions/blog'
import ImageUpload from '@/components/admin/ImageUpload'
import RichMarkdownEditor from '@/components/admin/RichMarkdownEditor'
import SEOPreview from '@/components/admin/SEOPreview'
import PublishScheduler from '@/components/admin/PublishScheduler'
import { useAutoSave, AutoSaveIndicator } from '@/hooks/useAutoSave'
import { type LocalizedString } from '@/i18n/config'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getEnglishValue(value: LocalizedString | string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.en || value.ms || ''
}

type FormData = {
  title: LocalizedString
  slug: string
  excerpt: LocalizedString
  content: LocalizedString
  featuredImage: string
  category: string
  tags: string[]
  metaTitle: LocalizedString
  metaDescription: LocalizedString
  isPublished: boolean
  scheduledFor: Date | null
  publishedAt: Date | null
}

export default function BlogPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!isNew)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'ms'>('en')
  const [showShortcuts, setShowShortcuts] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: { en: '', ms: '' },
    slug: '',
    excerpt: { en: '', ms: '' },
    content: { en: '', ms: '' },
    featuredImage: '',
    category: '',
    tags: [],
    metaTitle: { en: '', ms: '' },
    metaDescription: { en: '', ms: '' },
    isPublished: false,
    scheduledFor: null,
    publishedAt: null,
  })

  const [tagInput, setTagInput] = useState('')

  // Auto-save functionality
  const handleAutoSave = useCallback(async (data: FormData) => {
    if (isNew) return // Don't auto-save new posts
    await updateBlogPost(resolvedParams.id, {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage,
      category: data.category,
      tags: data.tags,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    })
  }, [isNew, resolvedParams.id])

  const autoSave = useAutoSave({
    data: formData,
    onSave: handleAutoSave,
    interval: 30000,
    enabled: !isNew && !isLoading,
  })

  // Load existing post
  useEffect(() => {
    if (!isNew) {
      async function loadPost() {
        try {
          const response = await fetch(`/api/blog/${resolvedParams.id}`)
          if (response.ok) {
            const post = await response.json()
            if (post) {
              const normalizeField = (field: LocalizedString | string | null): LocalizedString => {
                if (!field) return { en: '', ms: '' }
                if (typeof field === 'string') return { en: field, ms: field }
                return { en: field.en || '', ms: field.ms || '' }
              }

              setFormData({
                title: normalizeField(post.title),
                slug: post.slug || '',
                excerpt: normalizeField(post.excerpt),
                content: normalizeField(post.content),
                featuredImage: post.featuredImage || '',
                category: post.category || '',
                tags: (post.tags as string[]) || [],
                metaTitle: normalizeField(post.metaTitle),
                metaDescription: normalizeField(post.metaDescription),
                isPublished: post.isPublished || false,
                scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Save: Cmd/Ctrl + S
      if (isMod && e.key === 's') {
        e.preventDefault()
        handleSave()
      }

      // Publish: Cmd/Ctrl + Enter
      if (isMod && e.key === 'Enter') {
        e.preventDefault()
        handleSave(true)
      }

      // Preview: Cmd/Ctrl + P
      if (isMod && e.key === 'p' && formData.slug) {
        e.preventDefault()
        window.open(`/blog/${formData.slug}`, '_blank')
      }

      // Show shortcuts: Cmd/Ctrl + /
      if (isMod && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(!showShortcuts)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [formData.slug, showShortcuts])

  const handleTitleChange = (lang: 'en' | 'ms', value: string) => {
    const newTitle = { ...formData.title, [lang]: value }
    setFormData({
      ...formData,
      title: newTitle,
      slug: isNew ? generateSlug(getEnglishValue(newTitle)) : formData.slug,
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
    const titleValue = getEnglishValue(formData.title)
    const contentValue = getEnglishValue(formData.content)

    if (!titleValue.trim()) {
      setMessage({ type: 'error', text: 'Title is required (at least in English)' })
      return
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'Slug is required' })
      return
    }
    if (!contentValue.trim()) {
      setMessage({ type: 'error', text: 'Content is required (at least in English)' })
      return
    }

    setMessage(null)
    startTransition(async () => {
      try {
        const data = {
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          featuredImage: formData.featuredImage,
          category: formData.category,
          tags: formData.tags,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
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
            setMessage({ type: 'success', text: publish ? 'Post published!' : 'Post saved!' })
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

  const handlePublish = () => handleSave(true)
  const handleUnpublish = () => handleSave(false)
  const handleSchedule = (date: Date) => {
    setFormData({ ...formData, scheduledFor: date })
    // TODO: Implement scheduling in backend
    setMessage({ type: 'success', text: `Scheduled for ${date.toLocaleString()}` })
  }
  const handleCancelSchedule = () => {
    setFormData({ ...formData, scheduledFor: null })
    setMessage({ type: 'success', text: 'Schedule cancelled' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard/blog"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="font-heading text-xl font-semibold text-foundation-charcoal">
                  {isNew ? 'Create New Post' : 'Edit Post'}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <AutoSaveIndicator {...autoSave} />
                  {autoSave.hasUnsavedChanges && (
                    <span className="text-xs text-amber-600">• Unsaved changes</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Keyboard Shortcuts Button */}
              <button
                type="button"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Keyboard shortcuts (⌘/)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>

              {/* Preview Button */}
              {!isNew && formData.slug && (
                <Link
                  href={`/blog/${formData.slug}`}
                  target="_blank"
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Preview
                </Link>
              )}

              {/* Save Draft */}
              <button
                onClick={() => handleSave()}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isPending ? 'Saving...' : 'Save Draft'}
              </button>

              {/* Publish */}
              <button
                onClick={handlePublish}
                disabled={isPending}
                className="px-5 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {formData.isPublished ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                {[
                  { keys: '⌘/Ctrl + S', action: 'Save draft' },
                  { keys: '⌘/Ctrl + Enter', action: 'Publish' },
                  { keys: '⌘/Ctrl + P', action: 'Open preview' },
                  { keys: '⌘/Ctrl + B', action: 'Bold text' },
                  { keys: '⌘/Ctrl + I', action: 'Italic text' },
                  { keys: '⌘/Ctrl + K', action: 'Insert link' },
                  { keys: '⌘/Ctrl + /', action: 'Show shortcuts' },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50"
          >
            <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-2 hover:opacity-80"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Main Editor - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              {/* Language Tabs */}
              <div className="flex items-center gap-2 mb-4">
                {(['en', 'ms'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === lang
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {lang === 'en' ? '🇬🇧 English' : '🇲🇾 Malay'}
                  </button>
                ))}
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title[activeTab]}
                  onChange={(e) => handleTitleChange(activeTab, e.target.value)}
                  className="w-full px-4 py-3 text-xl font-heading font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder={activeTab === 'en' ? 'Enter post title...' : 'Masukkan tajuk artikel...'}
                />
                <p className="mt-1 text-xs text-gray-400">{formData.title[activeTab].length} characters</p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono text-sm"
                    placeholder="post-url-slug"
                  />
                </div>
              </div>
            </div>

            {/* Excerpt Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt / Summary
              </label>
              <textarea
                value={formData.excerpt[activeTab]}
                onChange={(e) => setFormData({
                  ...formData,
                  excerpt: { ...formData.excerpt, [activeTab]: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                placeholder={activeTab === 'en' ? 'Brief description for previews...' : 'Penerangan ringkas untuk pratonton...'}
              />
              <p className="mt-1 text-xs text-gray-400">{formData.excerpt[activeTab].length}/300 characters recommended</p>
            </div>

            {/* Content Editor Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Content <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">
                  {activeTab === 'en' ? 'English' : 'Malay'} version
                </span>
              </div>
              <RichMarkdownEditor
                value={formData.content[activeTab]}
                onChange={(value) => setFormData({
                  ...formData,
                  content: { ...formData.content, [activeTab]: value }
                })}
                placeholder={activeTab === 'en'
                  ? 'Start writing your content...\n\nUse the toolbar or keyboard shortcuts for formatting.'
                  : 'Mula menulis kandungan anda...\n\nGunakan bar alat atau pintasan papan kekunci untuk pemformatan.'
                }
                minHeight="500px"
                autoFocus={isNew}
              />
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Publishing */}
            <PublishScheduler
              isPublished={formData.isPublished}
              publishedAt={formData.publishedAt}
              scheduledFor={formData.scheduledFor}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onSchedule={handleSchedule}
              onCancelSchedule={handleCancelSchedule}
              isPending={isPending}
            />

            {/* Featured Image */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-medium text-foundation-charcoal mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Featured Image
              </h3>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                aspectRatio="video"
                maxSizeMB={10}
              />
            </div>

            {/* Category & Tags */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-medium text-foundation-charcoal mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category & Tags
              </h3>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">Select category</option>
                  <option value="news">📰 News</option>
                  <option value="updates">📣 Updates</option>
                  <option value="stories">💫 Impact Stories</option>
                  <option value="events">🎉 Events</option>
                  <option value="announcements">📢 Announcements</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        #{tag}
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
            </div>

            {/* SEO Preview */}
            <SEOPreview
              title={getEnglishValue(formData.metaTitle) || getEnglishValue(formData.title)}
              description={getEnglishValue(formData.metaDescription) || getEnglishValue(formData.excerpt)}
              slug={formData.slug}
            />

            {/* SEO Settings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-medium text-foundation-charcoal mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Meta Title ({activeTab.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle[activeTab]}
                    onChange={(e) => setFormData({
                      ...formData,
                      metaTitle: { ...formData.metaTitle, [activeTab]: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    placeholder="SEO title (leave empty to use post title)"
                  />
                  <p className="mt-1 text-xs text-gray-400">{formData.metaTitle[activeTab].length}/60</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Meta Description ({activeTab.toUpperCase()})
                  </label>
                  <textarea
                    value={formData.metaDescription[activeTab]}
                    onChange={(e) => setFormData({
                      ...formData,
                      metaDescription: { ...formData.metaDescription, [activeTab]: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                    placeholder="SEO description (leave empty to use excerpt)"
                  />
                  <p className="mt-1 text-xs text-gray-400">{formData.metaDescription[activeTab].length}/160</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
