'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getPageSEO, updatePageSEO } from '@/lib/actions/content'
import ImageUpload from '@/components/admin/ImageUpload'
import BilingualInput, { type LocalizedValue } from '@/components/admin/BilingualInput'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

interface PageSEO {
  slug: string
  title: LocalizedValue
  metaTitle: LocalizedValue
  metaDescription: LocalizedValue
  ogImage: string
}

// Helper to convert LocalizedString to LocalizedValue for the component
const toLocalizedValue = (value: LocalizedString | string | null | undefined): LocalizedValue => {
  if (!value) return { en: '', ms: '' }
  if (typeof value === 'string') return { en: value, ms: value }
  return { en: value.en || '', ms: value.ms || '' }
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
  const [previewLang, setPreviewLang] = useState<'en' | 'ms'>('en')
  const [formData, setFormData] = useState<PageSEO>({
    slug: '',
    title: { en: '', ms: '' },
    metaTitle: { en: '', ms: '' },
    metaDescription: { en: '', ms: '' },
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
          title: toLocalizedValue(data.title),
          metaTitle: toLocalizedValue(data.metaTitle),
          metaDescription: toLocalizedValue(data.metaDescription),
          ogImage: data.ogImage || '',
        })
      } else {
        setFormData({
          slug: slug || 'home',
          title: { en: selectedPage.name, ms: selectedPage.name },
          metaTitle: { en: '', ms: '' },
          metaDescription: { en: '', ms: '' },
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
          <p className="text-sm text-gray-500 mt-1">
            Configure SEO for both English and Bahasa Melayu
          </p>
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
                  <BilingualInput
                    label="Page Title"
                    value={formData.title}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                    placeholder={{ en: 'Page title in English', ms: 'Tajuk halaman dalam Bahasa Melayu' }}
                  />

                  <BilingualInput
                    label="Meta Title"
                    value={formData.metaTitle}
                    onChange={(value) => setFormData({ ...formData, metaTitle: value })}
                    placeholder={{ en: 'SEO title for search engines', ms: 'Tajuk SEO untuk enjin carian' }}
                    helperText="Appears in search results. Recommended: 50-60 characters."
                  />

                  <BilingualInput
                    label="Meta Description"
                    value={formData.metaDescription}
                    onChange={(value) => setFormData({ ...formData, metaDescription: value })}
                    type="textarea"
                    rows={3}
                    placeholder={{ en: 'Brief description for search engines', ms: 'Penerangan ringkas untuk enjin carian' }}
                    helperText="Appears below the title in search results. Recommended: 150-160 characters."
                  />

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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-lg font-semibold text-foundation-charcoal">
                    Search Result Preview
                  </h2>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewLang('en')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        previewLang === 'en'
                          ? 'bg-white text-teal-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setPreviewLang('ms')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        previewLang === 'ms'
                          ? 'bg-white text-teal-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Bahasa Melayu
                    </button>
                  </div>
                </div>
                <div className="max-w-xl">
                  <div className="mb-1 text-sm text-green-700 truncate">
                    insanprihatin.org/{previewLang}{selectedPage.path}
                  </div>
                  <div className="text-xl text-blue-700 hover:underline cursor-pointer mb-1 line-clamp-1">
                    {formData.metaTitle[previewLang] || formData.title[previewLang] || selectedPage.name} - Yayasan Insan Prihatin
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {formData.metaDescription[previewLang] || 'No description set. Add a meta description to improve your search visibility.'}
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
