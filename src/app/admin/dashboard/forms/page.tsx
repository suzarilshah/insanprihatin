'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface FormData {
  id: string
  name: string
  slug: string
  title: string | null
  description: string | null
  fields: unknown[]
  isActive: boolean
  createdAt: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadForms() {
      try {
        const response = await fetch('/api/forms')
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
            Forms
          </h1>
          <p className="text-gray-500 mt-1">Create and manage embedded forms for projects and blog posts</p>
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

      {/* Info Card */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-teal-800 mb-1">How to use forms</h3>
            <p className="text-teal-700 text-sm mb-3">
              Create a form, then embed it in your project or blog post content using the placeholder syntax:
            </p>
            <code className="inline-block px-3 py-2 bg-teal-100 rounded-lg text-teal-900 font-mono text-sm">
              {'{{form:your-form-slug}}'}
            </code>
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
          <div className="text-5xl mb-4">📝</div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/dashboard/forms/${form.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 hover:border-teal-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    form.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-1 group-hover:text-teal-600 transition-colors">
                  {form.name}
                </h3>

                {form.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{form.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {'{{form:' + form.slug + '}}'}
                    </code>
                  </div>
                  <div className="text-xs text-gray-400">
                    {Array.isArray(form.fields) ? form.fields.length : 0} fields
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
