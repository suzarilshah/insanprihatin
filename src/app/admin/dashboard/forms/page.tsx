'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Quick export button for form list
function QuickExportButton({ formId, formName, disabled }: { formId: string; formName: string; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (e: React.MouseEvent, format: 'xlsx' | 'csv') => {
    e.preventDefault()
    e.stopPropagation()
    setIsExporting(true)
    setIsOpen(false)

    try {
      const response = await fetch(`/api/forms/${formId}/export?format=${format}`, {
        credentials: 'include',
      })

      // Check content type to see if it's an error response
      const contentType = response.headers.get('content-type') || ''

      if (!response.ok || contentType.includes('application/json')) {
        // If it's JSON, it might be an error response
        if (contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Export failed')
        }
        throw new Error(`Export failed with status: ${response.status}`)
      }

      const contentDisposition = response.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `${formName}_responses.${format}`

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
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to export responses: ${message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled || isExporting}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
        }`}
        title={disabled ? 'No responses to export' : 'Export responses'}
      >
        {isExporting ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20"
            >
              <button
                onClick={(e) => handleExport(e, 'xlsx')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 transition-colors text-left text-sm"
              >
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel (.xlsx)
              </button>
              <button
                onClick={(e) => handleExport(e, 'csv')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors text-left text-sm"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                CSV (.csv)
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FormUsage {
  blogPosts: Array<{ id: string; title: string; slug: string; isPublished: boolean }>
  projects: Array<{ id: string; title: string; slug: string; isPublished: boolean }>
  totalUsage: number
}

interface FormData {
  id: string
  name: string
  slug: string
  title: string | null
  description: string | null
  fields: unknown[]
  isActive: boolean
  createdAt: string
  totalSubmissions: number
  unreadSubmissions: number
  usage: FormUsage
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-mono transition-colors group"
      title="Click to copy"
    >
      <span className="truncate max-w-[150px]">{label || text}</span>
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

function StatCard({ label, value, icon, color = 'teal' }: { label: string; value: number | string; icon: React.ReactNode; color?: 'teal' | 'amber' | 'blue' | 'purple' }) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foundation-charcoal">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedUsage, setExpandedUsage] = useState<string | null>(null)

  useEffect(() => {
    async function loadForms() {
      try {
        const response = await fetch('/api/forms?withStats=true')
        if (response.ok) {
          const data = await response.json()
          setForms(data)
        }
      } catch (error) {
        console.error('Failed to load forms:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadForms()
  }, [])

  // Calculate totals
  const totalForms = forms.length
  const activeForms = forms.filter(f => f.isActive).length
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.totalSubmissions || 0), 0)
  const unreadSubmissions = forms.reduce((acc, f) => acc + (f.unreadSubmissions || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Forms</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Form Management
          </h1>
          <p className="text-gray-500 mt-1">Create, manage, and track form submissions</p>
        </div>
        <Link
          href="/admin/dashboard/forms/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Form
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Forms"
          value={totalForms}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="teal"
        />
        <StatCard
          label="Active Forms"
          value={activeForms}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="blue"
        />
        <StatCard
          label="Total Responses"
          value={totalSubmissions}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
          color="purple"
        />
        <StatCard
          label="Unread Responses"
          value={unreadSubmissions}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          color="amber"
        />
      </div>

      {/* How to Use Card */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-xl flex-shrink-0">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-teal-800 mb-2">How to embed forms</h3>
            <p className="text-teal-700 text-sm mb-3">
              Create a form, then embed it anywhere in your project or blog post content using the placeholder syntax:
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <code className="inline-block px-3 py-2 bg-teal-100 rounded-lg text-teal-900 font-mono text-sm">
                {'{{form:your-form-slug}}'}
              </code>
              <span className="text-teal-600 text-sm">Copy the embed code from any form below</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
            No forms yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first form to collect RSVP responses, inquiries, or feedback from visitors.
          </p>
          <Link href="/admin/dashboard/forms/new" className="btn-primary">
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-teal-200 hover:shadow-lg transition-all"
            >
              {/* Main Row */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Form Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/admin/dashboard/forms/${form.id}`}
                        className="font-heading text-lg font-semibold text-foundation-charcoal hover:text-teal-600 transition-colors truncate"
                      >
                        {form.name}
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        form.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {form.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-1">{form.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <CopyButton text={`{{form:${form.slug}}}`} label={`{{form:${form.slug}}}`} />
                      <span className="text-xs text-gray-400">
                        {Array.isArray(form.fields) ? form.fields.length : 0} fields
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    {/* Responses */}
                    <Link
                      href={`/admin/dashboard/forms/${form.id}/responses`}
                      className="text-center group"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-2xl font-bold text-foundation-charcoal group-hover:text-teal-600 transition-colors">
                          {form.totalSubmissions || 0}
                        </p>
                        {(form.unreadSubmissions || 0) > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            {form.unreadSubmissions} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 group-hover:text-teal-600 transition-colors">Responses</p>
                    </Link>

                    {/* Usage */}
                    <button
                      onClick={() => setExpandedUsage(expandedUsage === form.id ? null : form.id)}
                      className="text-center group"
                    >
                      <p className="text-2xl font-bold text-foundation-charcoal group-hover:text-teal-600 transition-colors">
                        {form.usage?.totalUsage || 0}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-teal-600 transition-colors flex items-center gap-1">
                        Used in
                        <svg className={`w-3 h-3 transition-transform ${expandedUsage === form.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </p>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <QuickExportButton
                        formId={form.id}
                        formName={form.name}
                        disabled={(form.totalSubmissions || 0) === 0}
                      />
                      <Link
                        href={`/admin/dashboard/forms/${form.id}/responses`}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="View responses"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/dashboard/forms/${form.id}`}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit form"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Usage Details */}
              <AnimatePresence>
                {expandedUsage === form.id && (form.usage?.totalUsage || 0) > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 bg-gray-50 overflow-hidden"
                  >
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Used in the following content:
                      </p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {form.usage?.blogPosts?.map((post) => (
                          <Link
                            key={post.id}
                            href={`/admin/dashboard/blog/${post.id}`}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-teal-50 transition-colors group"
                          >
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              Blog
                            </span>
                            <span className="text-sm text-gray-700 group-hover:text-teal-700 truncate flex-1">
                              {post.title}
                            </span>
                            {!post.isPublished && (
                              <span className="text-xs text-gray-400">Draft</span>
                            )}
                          </Link>
                        ))}
                        {form.usage?.projects?.map((project) => (
                          <Link
                            key={project.id}
                            href={`/admin/dashboard/projects/${project.id}`}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-teal-50 transition-colors group"
                          >
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Project
                            </span>
                            <span className="text-sm text-gray-700 group-hover:text-teal-700 truncate flex-1">
                              {project.title}
                            </span>
                            {!project.isPublished && (
                              <span className="text-xs text-gray-400">Draft</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Usage Message */}
              <AnimatePresence>
                {expandedUsage === form.id && (form.usage?.totalUsage || 0) === 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 bg-gray-50 overflow-hidden"
                  >
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">
                        This form is not embedded in any content yet.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Copy the embed code above and paste it into a project or blog post.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
