'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/actions/content'
import BilingualInput, { type LocalizedValue } from '@/components/admin/BilingualInput'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

interface FAQ {
  id: string
  question: LocalizedString | string
  answer: LocalizedString | string
  category?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
}

// Helper to convert LocalizedString to LocalizedValue for the component
const toLocalizedValue = (value: LocalizedString | string | null | undefined): LocalizedValue => {
  if (!value) return { en: '', ms: '' }
  if (typeof value === 'string') return { en: value, ms: value }
  return { en: value.en || '', ms: value.ms || '' }
}

// Helper to get string value from LocalizedString (default to English for admin display)
const getTextValue = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

export default function EditFAQs() {
  const [isPending, startTransition] = useTransition()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    question: { en: '', ms: '' } as LocalizedValue,
    answer: { en: '', ms: '' } as LocalizedValue,
    category: '',
    sortOrder: 0,
  })

  useEffect(() => {
    loadFAQs()
  }, [])

  async function loadFAQs() {
    try {
      const data = await getFAQs()
      setFaqs(data as FAQ[])
    } catch (error) {
      console.error('Failed to load FAQs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        if (editingFaq) {
          const result = await updateFAQ(editingFaq.id, {
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            sortOrder: formData.sortOrder,
          })
          if (result.success) {
            setMessage({ type: 'success', text: 'FAQ updated successfully!' })
          }
        } else {
          const result = await createFAQ({
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            sortOrder: formData.sortOrder,
          })
          if (result.success) {
            setMessage({ type: 'success', text: 'FAQ created successfully!' })
          }
        }
        setShowForm(false)
        setEditingFaq(null)
        setFormData({ question: { en: '', ms: '' }, answer: { en: '', ms: '' }, category: '', sortOrder: 0 })
        loadFAQs()
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
      }
    })
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: toLocalizedValue(faq.question),
      answer: toLocalizedValue(faq.answer),
      category: faq.category || '',
      sortOrder: faq.sortOrder || 0,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    startTransition(async () => {
      try {
        const result = await deleteFAQ(id)
        if (result.success) {
          setMessage({ type: 'success', text: 'FAQ deleted successfully!' })
          loadFAQs()
        }
      } catch (error) {
        console.error('Failed to delete:', error)
        setMessage({ type: 'error', text: 'Failed to delete FAQ.' })
      }
    })
  }

  const handleAddNew = () => {
    setEditingFaq(null)
    setFormData({ question: { en: '', ms: '' }, answer: { en: '', ms: '' }, category: '', sortOrder: faqs.length })
    setShowForm(true)
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
            <span className="text-foundation-charcoal">FAQs</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage FAQs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create FAQs in both English and Bahasa Melayu
          </p>
        </div>
        <button onClick={handleAddNew} className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add FAQ
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

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl font-semibold text-foundation-charcoal mb-6">
              {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>

            <div className="space-y-6">
              <BilingualInput
                label="Question"
                value={formData.question}
                onChange={(value) => setFormData({ ...formData, question: value })}
                placeholder={{ en: 'e.g., How can I donate?', ms: 'cth., Bagaimana saya boleh menderma?' }}
                required
              />

              <BilingualInput
                label="Answer"
                value={formData.answer}
                onChange={(value) => setFormData({ ...formData, answer: value })}
                type="textarea"
                rows={5}
                placeholder={{ en: 'Provide a detailed answer...', ms: 'Berikan jawapan terperinci...' }}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., Donations"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !formData.question.en || !formData.answer.en}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {faq.category && (
                    <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-medium">
                      {faq.category}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">#{(faq.sortOrder || 0) + 1}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                  {getTextValue(faq.question)}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{getTextValue(faq.answer)}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 mb-4">No FAQs yet</p>
            <button onClick={handleAddNew} className="btn-primary">
              Add Your First FAQ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
