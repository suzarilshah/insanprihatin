'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Form {
  id: string
  name: string
  slug: string
  title: string | null
  description: string | null
  fields: unknown[]
  isActive: boolean
}

interface FormSelectorProps {
  onInsert: (embedCode: string) => void
}

export default function FormSelector({ onInsert }: FormSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && forms.length === 0) {
      loadForms()
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadForms = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data.filter((f: Form) => f.isActive))
      }
    } catch (error) {
      console.error('Failed to load forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = (form: Form) => {
    const embedCode = `{{form:${form.slug}}}`
    onInsert(embedCode)
    setIsOpen(false)
  }

  const handleCopy = async (form: Form) => {
    const embedCode = `{{form:${form.slug}}}`
    await navigator.clipboard.writeText(embedCode)
    setCopiedId(form.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium border border-teal-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Insert Form
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Insert Form</h4>
                <Link
                  href="/admin/dashboard/forms/new"
                  target="_blank"
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  + New Form
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click to insert or copy the embed code
              </p>
            </div>

            {/* Form List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                </div>
              ) : forms.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No active forms</p>
                  <Link
                    href="/admin/dashboard/forms/new"
                    target="_blank"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Create your first form
                  </Link>
                </div>
              ) : (
                <div className="py-1">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foundation-charcoal text-sm truncate">
                            {form.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {'{{form:' + form.slug + '}}'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCopy(form)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Copy embed code"
                          >
                            {copiedId === form.id ? (
                              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleInsert(form)}
                            className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                            title="Insert into content"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {forms.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <Link
                  href="/admin/dashboard/forms"
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-teal-600"
                >
                  Manage all forms →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
