'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getPageSEO, updatePageSEO } from '@/lib/actions/content'
import ImageUpload from '@/components/admin/ImageUpload'

interface PageSEO {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  ogImage: string
}

const pages = [
  { slug: '', name: 'Home', path: '/' },
  { slug: 'about', name: 'About', path: '/about' },
  { slug: 'projects', name: 'Projects', path: '/projects' },
  { slug: 'blog', name: 'Blog', path: '/blog' },
  { slug: 'contact', name: 'Contact', path: '/contact' },
  { slug: 'donate', name: 'Donate', path: '/donate' },
]

export default function EditSEOSettings() {
  const [isPending, startTransition] = useTransition()
  const [selectedPage, setSelectedPage] = useState(pages[0])
  const [formData, setFormData] = useState<PageSEO>({
    slug: '',
    title: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPageSEO(selectedPage.slug)
  }, [selectedPage])

  async function loadPageSEO(slug: string) {
    setIsLoading(true)
    try {
      const data = await getPageSEO(slug || 'home')
      if (data) {
        setFormData({
          slug: data.slug,
          title: data.title || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || '',
        })
      } else {
        setFormData({
          slug: slug || 'home',
          title: selectedPage.name,
          metaTitle: '',
          metaDescription: '',
          ogImage: '',
        })
      }
    } catch (error) {
      console.error('Failed to load SEO settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await updatePageSEO(selectedPage.slug || 'home', {
          title: formData.title,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          ogImage: formData.ogImage,
        })
        if (result.success) {
          setMessage({ type: 'success', text: 'SEO settings updated successfully!' })
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
      }
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/dashboard/content" className="hover:text-teal-600">Content</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">SEO Settings</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            SEO Settings
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
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

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="font-heading text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Pages
            </h2>
            <nav className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedPage.slug === page.slug
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{page.name}</span>
                    <span className="text-xs text-gray-400">{page.path}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* SEO Form */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
                <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                  Meta Information for {selectedPage.name} Page
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      placeholder="Page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                      <span className="text-gray-400 font-normal ml-2">
                        ({formData.metaTitle.length}/60 characters)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      placeholder="SEO title for search engines"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Appears in search results. Recommended: 50-60 characters.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                      <span className="text-gray-400 font-normal ml-2">
                        ({formData.metaDescription.length}/160 characters)
                      </span>
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                      placeholder="Brief description for search engines"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Appears below the title in search results. Recommended: 150-160 characters.
                    </p>
                  </div>

                  <ImageUpload
                    value={formData.ogImage}
                    onChange={(url) => setFormData({ ...formData, ogImage: url })}
                    label="Open Graph Image"
                    aspectRatio="wide"
                    maxSizeMB={5}
                  />
                  <p className="text-xs text-gray-500 -mt-4">
                    Image displayed when sharing on social media. Recommended: 1200x630 pixels.
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
                <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                  Search Result Preview
                </h2>
                <div className="max-w-xl">
                  <div className="mb-1 text-sm text-green-700 truncate">
                    yayasaninsanprihatin.org{selectedPage.path}
                  </div>
                  <div className="text-xl text-blue-700 hover:underline cursor-pointer mb-1 line-clamp-1">
                    {formData.metaTitle || formData.title || selectedPage.name} - Yayasan Insan Prihatin
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {formData.metaDescription || 'No description set. Add a meta description to improve your search visibility.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
