'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getHeroContent, updateHeroContent } from '@/lib/actions/content'
import ImageUpload from '@/components/admin/ImageUpload'
import BilingualInput, { type LocalizedValue } from '@/components/admin/BilingualInput'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to convert LocalizedString to LocalizedValue for the component
const toLocalizedValue = (value: LocalizedString | string | null | undefined): LocalizedValue => {
  if (!value) return { en: '', ms: '' }
  if (typeof value === 'string') return { en: value, ms: value }
  return { en: value.en || '', ms: value.ms || '' }
}

export default function EditHeroContent() {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: { en: '', ms: '' } as LocalizedValue,
    subtitle: { en: '', ms: '' } as LocalizedValue,
    description: { en: '', ms: '' } as LocalizedValue,
    ctaText: { en: '', ms: '' } as LocalizedValue,
    ctaLink: '',
    backgroundImage: '',
  })
  const [showPreview, setShowPreview] = useState(false)
  const [previewLang, setPreviewLang] = useState<'en' | 'ms'>('en')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      try {
        const hero = await getHeroContent()
        if (hero) {
          setFormData({
            title: toLocalizedValue(hero.title),
            subtitle: toLocalizedValue(hero.subtitle),
            description: toLocalizedValue(hero.description),
            ctaText: toLocalizedValue(hero.ctaText),
            ctaLink: hero.ctaLink || '',
            backgroundImage: hero.backgroundImage || '',
          })
        }
      } catch (error) {
        console.error('Failed to load hero content:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [])

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await updateHeroContent({
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          ctaText: formData.ctaText,
          ctaLink: formData.ctaLink,
          backgroundImage: formData.backgroundImage,
        })
        if (result.success) {
          setMessage({ type: 'success', text: 'Hero section updated successfully!' })
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
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
            <Link href="/admin/dashboard/content" className="hover:text-teal-600">Content</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Hero Section</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Edit Hero Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit content in both English and Bahasa Melayu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
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

      <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Content Settings
          </h2>

          <div className="space-y-6">
            <BilingualInput
              label="Subtitle (Badge Text)"
              value={formData.subtitle}
              onChange={(value) => setFormData({ ...formData, subtitle: value })}
              placeholder={{ en: 'e.g., Yayasan Insan Prihatin', ms: 'cth., Yayasan Insan Prihatin' }}
            />

            <BilingualInput
              label="Main Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder={{ en: 'e.g., Empowering Communities Through Compassion', ms: 'cth., Memperkasa Komuniti Melalui Belas Kasihan' }}
              helperText="Tip: Keep it concise and impactful. Recommended: 5-8 words."
            />

            <BilingualInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              type="textarea"
              rows={4}
              placeholder={{ en: "Describe your foundation's mission...", ms: 'Jelaskan misi yayasan anda...' }}
              helperText={`${formData.description.en.length}/200 characters recommended`}
            />

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-medium text-foundation-charcoal mb-4">
                Call to Action Button
              </h3>

              <div className="space-y-4">
                <BilingualInput
                  label="Button Text"
                  value={formData.ctaText}
                  onChange={(value) => setFormData({ ...formData, ctaText: value })}
                  placeholder={{ en: 'e.g., Explore Our Impact', ms: 'cth., Terokai Impak Kami' }}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="e.g., /projects"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <ImageUpload
                value={formData.backgroundImage}
                onChange={(url) => setFormData({ ...formData, backgroundImage: url })}
                label="Background Image"
                aspectRatio="wide"
                maxSizeMB={15}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal">
                Live Preview
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
            <div
              className="relative aspect-[16/10] rounded-xl overflow-hidden"
              style={{
                backgroundImage: formData.backgroundImage
                  ? `url(${formData.backgroundImage})`
                  : 'linear-gradient(to bottom right, rgb(13, 148, 136), rgb(14, 116, 144))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-center p-8">
                <div className="text-white max-w-md">
                  {formData.subtitle[previewLang] && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm mb-4">
                      <span className="w-2 h-2 bg-amber-400 rounded-full" />
                      {formData.subtitle[previewLang]}
                    </div>
                  )}
                  <h1 className="text-2xl font-bold mb-3">{formData.title[previewLang] || 'Your Title Here'}</h1>
                  <p className="text-white/80 text-sm mb-4">
                    {formData.description[previewLang] || 'Your description will appear here...'}
                  </p>
                  {formData.ctaText[previewLang] && (
                    <span className="inline-block px-4 py-2 bg-amber-400 text-foundation-charcoal text-sm font-medium rounded-full">
                      {formData.ctaText[previewLang]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-center text-gray-500 text-xs mt-4">
              Preview is a simplified representation
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
