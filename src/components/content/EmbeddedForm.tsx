'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string from LocalizedString (default to English)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface ContentForm {
  id: string
  name: string
  slug: string
  title?: LocalizedString | string
  description?: LocalizedString | string
  submitButtonText?: LocalizedString | string
  successMessage?: LocalizedString | string
  fields: FormField[]
  isActive: boolean
}

interface EmbeddedFormProps {
  form: ContentForm
  sourceContentType?: 'projects' | 'blog_posts'
  sourceContentId?: string
  sourceContentTitle?: string
}

export default function EmbeddedForm({
  form,
  sourceContentType,
  sourceContentId,
  sourceContentTitle,
}: EmbeddedFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')
    setErrorMessage('')

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !formData[field.id]) {
        setStatus('error')
        setErrorMessage(`${field.label} is required`)
        return
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: form.id,
            formSlug: form.slug,
            data: formData,
            sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
            sourceContentType,
            sourceContentId,
            sourceContentTitle,
          }),
        })

        if (response.ok) {
          setStatus('success')
          setFormData({})
        } else {
          const result = await response.json()
          setStatus('error')
          setErrorMessage(result.error || 'Failed to submit form')
        }
      } catch (error) {
        setStatus('error')
        setErrorMessage('An error occurred. Please try again.')
      }
    })
  }

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const renderField = (field: FormField) => {
    const baseInputStyles = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all'

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${baseInputStyles} resize-none`}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={baseInputStyles}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[`${field.id}_${i}`] as boolean || false}
                  onChange={(e) => handleFieldChange(`${field.id}_${i}`, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-5 h-5 border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={baseInputStyles}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputStyles}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'your@email.com'}
            required={field.required}
            className={baseInputStyles}
          />
        )

      case 'phone':
        return (
          <input
            type="tel"
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || '+60 12-345 6789'}
            required={field.required}
            className={baseInputStyles}
          />
        )

      default:
        return (
          <input
            type="text"
            id={field.id}
            value={(formData[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputStyles}
          />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-foundation-pearl to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm"
    >
      {/* Form Header */}
      {(l(form.title) || l(form.description)) && (
        <div className="mb-6">
          {l(form.title) && (
            <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
              {l(form.title)}
            </h3>
          )}
          {l(form.description) && (
            <p className="text-gray-500">{l(form.description)}</p>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
              Submitted Successfully!
            </h4>
            <p className="text-gray-500">
              {l(form.successMessage) || 'Thank you for your submission!'}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              Submit Another Response
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {form.fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            {/* Error Message */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                l(form.submitButtonText) || 'Submit'
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
