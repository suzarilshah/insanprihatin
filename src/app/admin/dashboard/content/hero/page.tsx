'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function EditHeroContent() {
  const [formData, setFormData] = useState({
    title: 'Empowering Communities Through Compassion',
    subtitle: 'Yayasan Insan Prihatin',
    description: 'Building a better tomorrow through education, healthcare, and sustainable development. Join us in creating lasting impact for communities across Malaysia.',
    ctaText: 'Explore Our Impact',
    ctaLink: '/projects',
    secondaryCtaText: 'Make a Donation',
    secondaryCtaLink: '/donate',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
                <span>/</span>
                <Link href="/admin/dashboard/content" className="hover:text-teal-600">Content</Link>
                <span>/</span>
                <span className="text-foundation-charcoal">Hero Section</span>
              </div>
              <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
                Edit Hero Section
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary disabled:opacity-50"
              >
                {isSaving ? (
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
        </header>

        <div className="p-8">
          <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
            {/* Form */}
            <div className="admin-card p-8">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                Content Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="input-elegant"
                    placeholder="e.g., Yayasan Insan Prihatin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-elegant"
                    placeholder="e.g., Empowering Communities Through Compassion"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Keep it concise and impactful. Recommended: 5-8 words.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="textarea-elegant"
                    placeholder="Describe your foundation's mission..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/200 characters recommended
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-medium text-foundation-charcoal mb-4">
                    Call to Action Buttons
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="input-elegant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Button Link
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="input-elegant"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaText}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                        className="input-elegant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Button Link
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                        className="input-elegant"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-medium text-foundation-charcoal mb-4">
                    Background Image
                  </h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-400 text-xs">
                      PNG, JPG up to 5MB. Recommended: 1920x1080px
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="admin-card p-4 overflow-hidden"
              >
                <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-4">
                  Live Preview
                </h2>
                <div className="relative aspect-[16/10] bg-gradient-to-br from-teal-700 via-teal-600 to-sky-600 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-4">
                        <span className="w-2 h-2 bg-amber-400 rounded-full" />
                        {formData.subtitle}
                      </div>
                      <h1 className="text-2xl font-bold mb-3">{formData.title}</h1>
                      <p className="text-white/80 text-sm mb-4 max-w-xs mx-auto">
                        {formData.description}
                      </p>
                      <div className="flex justify-center gap-2">
                        <span className="px-3 py-1.5 bg-amber-400 text-foundation-charcoal text-xs rounded-full">
                          {formData.ctaText}
                        </span>
                        <span className="px-3 py-1.5 border border-white/30 text-xs rounded-full">
                          {formData.secondaryCtaText}
                        </span>
                      </div>
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
      </div>
    </div>
  )
}
