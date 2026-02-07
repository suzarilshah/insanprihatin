'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createBlogPost, updateBlogPost } from '@/lib/actions/blog'
import ImageUpload from '@/components/admin/ImageUpload'
import FormSelector from '@/components/admin/FormSelector'
import BilingualEditor from '@/components/admin/BilingualEditor'
import { type LocalizedString } from '@/i18n/config'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper to get string value from LocalizedString for slug generation
function getEnglishValue(value: LocalizedString | string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.en || value.ms || ''
}

export default function BlogPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!isNew)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const [editorMode, setEditorMode] = useState<'tabs' | 'side-by-side'>('tabs')

  // Form data with LocalizedString support
  const [formData, setFormData] = useState({
    title: { en: '', ms: '' } as LocalizedString,
    slug: '',
    excerpt: { en: '', ms: '' } as LocalizedString,
    content: { en: '', ms: '' } as LocalizedString,
    featuredImage: '',
    category: '',
    tags: [] as string[],
    metaTitle: { en: '', ms: '' } as LocalizedString,
    metaDescription: { en: '', ms: '' } as LocalizedString,
    isPublished: false,
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (!isNew) {
      async function loadPost() {
        try {
          const response = await fetch(`/api/blog/${resolvedParams.id}`)
          if (response.ok) {
            const post = await response.json()
            if (post) {
              // Handle both LocalizedString and string formats from DB
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

  const handleTitleChange = (title: LocalizedString) => {
    setFormData({
      ...formData,
      title,
      slug: isNew ? generateSlug(getEnglishValue(title)) : formData.slug,
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
            setMessage({ type: 'success', text: 'Post created successfully! Auto-translation applied.' })
            router.push('/admin/dashboard/blog')
          }
        } else {
          const result = await updateBlogPost(resolvedParams.id, data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Post updated successfully! Auto-translation applied.' })
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
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setEditorMode('tabs')}
              className={`px-3 py-1.5 text-xs font-medium rounded ${
                editorMode === 'tabs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Tabs
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('side-by-side')}
              className={`px-3 py-1.5 text-xs font-medium rounded ${
                editorMode === 'side-by-side' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Side by Side
            </button>
          </div>
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

      {/* Bilingual Editor Info Banner */}
      <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-teal-800">
            <p className="font-medium mb-1">Bilingual Content Editor</p>
            <p className="text-teal-700">
              Enter content in English, Malay, or both. Missing translations will be auto-generated when you save.
              Use the auto-translate button to preview translations before saving.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="space-y-6">
              {/* Title - Bilingual */}
              <BilingualEditor
                value={formData.title}
                onChange={handleTitleChange}
                label="Title"
                required
                placeholder={{ en: 'Enter post title...', ms: 'Masukkan tajuk artikel...' }}
                mode={editorMode}
                showCharCount
                maxLength={200}
              />

              {/* Slug */}
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

              {/* Excerpt - Bilingual */}
              <BilingualEditor
                value={formData.excerpt}
                onChange={(excerpt) => setFormData({ ...formData, excerpt })}
                label="Excerpt"
                placeholder={{ en: 'Brief description for previews...', ms: 'Penerangan ringkas untuk pratonton...' }}
                fieldType="textarea"
                rows={2}
                mode={editorMode}
                showCharCount
                maxLength={500}
              />

              {/* Content - Bilingual */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Content *</label>
                  <div className="flex items-center gap-3">
                    <FormSelector
                      onInsert={(embedCode) => {
                        setFormData({
                          ...formData,
                          content: {
                            en: formData.content.en + '\n\n' + embedCode + '\n',
                            ms: formData.content.ms + '\n\n' + embedCode + '\n',
                          },
                        })
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Markdown Help
                    </button>
                  </div>
                </div>

                {showMarkdownHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm"
                  >
                    <h4 className="font-medium text-teal-800 mb-2">Markdown Formatting</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-teal-700">
                      <div><code className="bg-teal-100 px-1 rounded"># Heading 1</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">## Heading 2</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">**bold**</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">*italic*</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">- bullet list</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">1. numbered list</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">[link](url)</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">&gt; blockquote</code></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-teal-200">
                      <h4 className="font-medium text-teal-800 mb-1">Embed Form</h4>
                      <p className="text-teal-700 text-xs mb-1">Add a form anywhere in your content:</p>
                      <code className="bg-teal-100 px-2 py-1 rounded block text-xs">{'{{form:your-form-slug}}'}</code>
                    </div>
                  </motion.div>
                )}

                <BilingualEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder={{
                    en: 'Write your content here...\n\n# Use Markdown for formatting\nWrite your content using **bold**, *italic*, lists, and more.',
                    ms: 'Tulis kandungan anda di sini...\n\n# Gunakan Markdown untuk pemformatan\nTulis kandungan menggunakan **tebal**, *italik*, senarai, dan lain-lain.'
                  }}
                  fieldType="textarea"
                  rows={15}
                  mode={editorMode}
                  showCharCount
                />
              </div>
            </div>
          </div>

          {/* Embedded Form Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-medium text-foundation-charcoal">Embedded Forms</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add feedback forms, surveys, or polls to your blog post.
            </p>
            <Link
              href="/admin/dashboard/forms/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Form
            </Link>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Tip:</strong> After creating a form, embed it in your content using <code className="bg-amber-100 px-1 rounded">{'{{form:slug}}'}</code>
              </p>
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
            <ImageUpload
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              label="Featured Image"
              aspectRatio="video"
              maxSizeMB={10}
            />
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

          {/* SEO - Bilingual */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <BilingualEditor
                value={formData.metaTitle}
                onChange={(metaTitle) => setFormData({ ...formData, metaTitle })}
                label="Meta Title"
                placeholder={{ en: 'SEO title...', ms: 'Tajuk SEO...' }}
                mode="tabs"
                showCharCount
                maxLength={70}
              />
              <BilingualEditor
                value={formData.metaDescription}
                onChange={(metaDescription) => setFormData({ ...formData, metaDescription })}
                label="Meta Description"
                placeholder={{ en: 'SEO description...', ms: 'Penerangan SEO...' }}
                fieldType="textarea"
                rows={2}
                mode="tabs"
                showCharCount
                maxLength={160}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
