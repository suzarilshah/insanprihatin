'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAboutContent, updateAboutContent } from '@/lib/actions/content'
import ImageUpload from '@/components/admin/ImageUpload'
import BilingualInput, { type LocalizedValue } from '@/components/admin/BilingualInput'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to convert LocalizedString to LocalizedValue for the component
const toLocalizedValue = (value: LocalizedString | string | null | undefined): LocalizedValue => {
  if (!value) return { en: '', ms: '' }
  if (typeof value === 'string') return { en: value, ms: value }
  return { en: value.en || '', ms: value.ms || '' }
}

export default function EditAboutContent() {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: { en: '', ms: '' } as LocalizedValue,
    content: { en: '', ms: '' } as LocalizedValue,
    mission: { en: '', ms: '' } as LocalizedValue,
    vision: { en: '', ms: '' } as LocalizedValue,
    values: [] as string[],
    image: '',
  })
  const [newValue, setNewValue] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      try {
        const about = await getAboutContent()
        if (about) {
          setFormData({
            title: toLocalizedValue(about.title),
            content: toLocalizedValue(about.content),
            mission: toLocalizedValue(about.mission),
            vision: toLocalizedValue(about.vision),
            values: (about.values as string[]) || [],
            image: about.image || '',
          })
        }
      } catch (error) {
        console.error('Failed to load about content:', error)
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
        const result = await updateAboutContent({
          title: formData.title,
          content: formData.content,
          mission: formData.mission,
          vision: formData.vision,
          values: formData.values,
          image: formData.image,
        })
        if (result.success) {
          setMessage({ type: 'success', text: 'About section updated successfully!' })
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
      }
    })
  }

  const addValue = () => {
    if (newValue.trim() && !formData.values.includes(newValue.trim())) {
      setFormData({
        ...formData,
        values: [...formData.values, newValue.trim()],
      })
      setNewValue('')
    }
  }

  const removeValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
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
            <span className="text-foundation-charcoal">About Section</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Edit About Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit content in both English and Bahasa Melayu
          </p>
        </div>
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Main Content
          </h2>

          <div className="space-y-6">
            <BilingualInput
              label="Section Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder={{ en: 'e.g., Caring for Humanity', ms: 'cth., Menyayangi Kemanusiaan' }}
            />

            <BilingualInput
              label="Description"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              type="textarea"
              placeholder={{ en: "Tell your organization's story...", ms: 'Ceritakan kisah organisasi anda...' }}
            />

            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Featured Image"
              aspectRatio="square"
              maxSizeMB={10}
            />
          </div>
        </div>

        {/* Mission, Vision & Values */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
            <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
              Mission & Vision
            </h2>

            <div className="space-y-6">
              <BilingualInput
                label="Our Mission"
                value={formData.mission}
                onChange={(value) => setFormData({ ...formData, mission: value })}
                type="textarea"
                placeholder={{ en: "What is your organization's mission?", ms: 'Apakah misi organisasi anda?' }}
              />

              <BilingualInput
                label="Our Vision"
                value={formData.vision}
                onChange={(value) => setFormData({ ...formData, vision: value })}
                type="textarea"
                placeholder={{ en: 'What future do you envision?', ms: 'Apakah masa depan yang anda bayangkan?' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
            <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
              Core Values
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addValue()}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Add a core value..."
                />
                <button
                  type="button"
                  onClick={addValue}
                  className="px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.values.map((value, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-teal-500 hover:text-teal-700"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
