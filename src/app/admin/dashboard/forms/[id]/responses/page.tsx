'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { markSubmissionAsRead, deleteFormSubmission, markMultipleSubmissionsAsRead, deleteMultipleSubmissions } from '@/lib/actions/forms'

// Export dropdown component
function ExportDropdown({ formId, disabled }: { formId: string; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setIsExporting(true)
    setIsOpen(false)

    try {
      const response = await fetch(`/api/forms/${formId}/export?format=${format}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from content-disposition header
      const contentDisposition = response.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `form_responses.${format}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export responses. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
            >
              <div className="p-2">
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foundation-charcoal">Excel (.xlsx)</p>
                    <p className="text-xs text-gray-500">Formatted with styling</p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foundation-charcoal">CSV (.csv)</p>
                    <p className="text-xs text-gray-500">Simple text format</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface FormSubmission {
  id: string
  formId: string
  formSlug: string
  data: Record<string, unknown>
  sourceUrl: string | null
  sourceContentType: string | null
  sourceContentId: string | null
  sourceContentTitle: string | null
  submitterEmail: string | null
  submitterName: string | null
  isRead: boolean
  createdAt: string
}

interface FormData {
  id: string
  name: string
  slug: string
  title: string | null
  description: string | null
  fields: FormField[]
  isActive: boolean
  totalSubmissions: number
  unreadSubmissions: number
  submissions: FormSubmission[]
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-mono transition-colors"
      title="Click to copy"
    >
      <span className="truncate max-w-[150px]">{text}</span>
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadForm() {
      try {
        const response = await fetch(`/api/forms/${resolvedParams.id}?withSubmissions=true`)
        if (response.ok) {
          const data = await response.json()
          setForm(data)
        }
      } catch (error) {
        console.error('Failed to load form:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadForm()
  }, [resolvedParams.id])

  const handleMarkAsRead = (submissionId: string) => {
    startTransition(async () => {
      const result = await markSubmissionAsRead(submissionId)
      if (result.success && form) {
        setForm({
          ...form,
          submissions: form.submissions.map(s =>
            s.id === submissionId ? { ...s, isRead: true } : s
          ),
          unreadSubmissions: form.unreadSubmissions - 1,
        })
      }
    })
  }

  const handleDelete = (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return

    startTransition(async () => {
      const result = await deleteFormSubmission(submissionId)
      if (result.success && form) {
        const submission = form.submissions.find(s => s.id === submissionId)
        setForm({
          ...form,
          submissions: form.submissions.filter(s => s.id !== submissionId),
          totalSubmissions: form.totalSubmissions - 1,
          unreadSubmissions: submission?.isRead ? form.unreadSubmissions : form.unreadSubmissions - 1,
        })
        setMessage({ type: 'success', text: 'Response deleted successfully' })
      }
    })
  }

  const handleBulkMarkAsRead = () => {
    if (selectedSubmissions.length === 0) return

    startTransition(async () => {
      const result = await markMultipleSubmissionsAsRead(selectedSubmissions)
      if (result.success && form) {
        const unreadSelected = form.submissions.filter(
          s => selectedSubmissions.includes(s.id) && !s.isRead
        ).length
        setForm({
          ...form,
          submissions: form.submissions.map(s =>
            selectedSubmissions.includes(s.id) ? { ...s, isRead: true } : s
          ),
          unreadSubmissions: form.unreadSubmissions - unreadSelected,
        })
        setSelectedSubmissions([])
        setMessage({ type: 'success', text: `${selectedSubmissions.length} responses marked as read` })
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedSubmissions.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedSubmissions.length} responses?`)) return

    startTransition(async () => {
      const result = await deleteMultipleSubmissions(selectedSubmissions)
      if (result.success && form) {
        const unreadDeleted = form.submissions.filter(
          s => selectedSubmissions.includes(s.id) && !s.isRead
        ).length
        setForm({
          ...form,
          submissions: form.submissions.filter(s => !selectedSubmissions.includes(s.id)),
          totalSubmissions: form.totalSubmissions - selectedSubmissions.length,
          unreadSubmissions: form.unreadSubmissions - unreadDeleted,
        })
        setSelectedSubmissions([])
        setMessage({ type: 'success', text: `${selectedSubmissions.length} responses deleted` })
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedSubmissions.length === form?.submissions.length) {
      setSelectedSubmissions([])
    } else {
      setSelectedSubmissions(form?.submissions.map(s => s.id) || [])
    }
  }

  const toggleSelectSubmission = (id: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getFieldLabel = (fieldId: string) => {
    const field = form?.fields.find(f => f.id === fieldId)
    return field?.label || fieldId
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Form not found</p>
        <Link href="/admin/dashboard/forms" className="text-teal-600 hover:underline mt-2 inline-block">
          Back to forms
        </Link>
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
            <Link href="/admin/dashboard/forms" className="hover:text-teal-600">Forms</Link>
            <span>/</span>
            <Link href={`/admin/dashboard/forms/${form.id}`} className="hover:text-teal-600">{form.name}</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Responses</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            {form.name} - Responses
          </h1>
          <p className="text-gray-500 mt-1">
            {form.totalSubmissions} total responses, {form.unreadSubmissions} unread
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CopyButton text={`{{form:${form.slug}}}`} />
          <ExportDropdown formId={form.id} disabled={form.submissions.length === 0} />
          <Link
            href={`/admin/dashboard/forms/${form.id}`}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Form
          </Link>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <p className="text-teal-700 font-medium">
            {selectedSubmissions.length} response{selectedSubmissions.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkAsRead}
              disabled={isPending}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              Mark as Read
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedSubmissions([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Responses List */}
      {form.submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
            No responses yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Responses will appear here once visitors submit this form.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedSubmissions.length === form.submissions.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">Select all</span>
            </div>
          </div>

          {/* Submissions */}
          <div className="divide-y divide-gray-100">
            {form.submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`${!submission.isRead ? 'bg-teal-50/30' : ''}`}
              >
                {/* Submission Row */}
                <div
                  className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)
                    if (!submission.isRead) {
                      handleMarkAsRead(submission.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelectSubmission(submission.id)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {!submission.isRead && (
                          <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                        )}
                        <p className="font-medium text-foundation-charcoal truncate">
                          {submission.submitterName || submission.submitterEmail || 'Anonymous'}
                        </p>
                        {submission.sourceContentTitle && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded truncate">
                            from: {submission.sourceContentTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(submission.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(submission.id)
                        }}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedSubmission === submission.id ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedSubmission === submission.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 ml-8">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          {Object.entries(submission.data).map(([fieldId, value]) => (
                            <div key={fieldId}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                {getFieldLabel(fieldId)}
                              </p>
                              <p className="text-foundation-charcoal">
                                {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                              </p>
                            </div>
                          ))}

                          {/* Metadata */}
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {submission.submitterEmail && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                  <p className="text-gray-700">{submission.submitterEmail}</p>
                                </div>
                              )}
                              {submission.sourceUrl && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Source URL</p>
                                  <a
                                    href={submission.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-600 hover:underline truncate block"
                                  >
                                    {submission.sourceUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
