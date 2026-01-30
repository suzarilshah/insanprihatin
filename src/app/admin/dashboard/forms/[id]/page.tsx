'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FormBuilder, { FormConfig, FormField } from '@/components/admin/FormBuilder'
import { createForm, updateForm, deleteForm } from '@/lib/actions/forms'

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function FormEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!isNew)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sendEmailNotification: true,
    notificationEmail: '',
    isActive: true,
  })

  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: '',
    description: '',
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your submission!',
    fields: [],
  })

  useEffect(() => {
    if (!isNew) {
      async function loadForm() {
        try {
          const response = await fetch(`/api/forms/${resolvedParams.id}`)
          if (response.ok) {
            const form = await response.json()
            if (form) {
              setFormData({
                name: form.name || '',
                slug: form.slug || '',
                sendEmailNotification: form.sendEmailNotification ?? true,
                notificationEmail: form.notificationEmail || '',
                isActive: form.isActive ?? true,
              })
              setFormConfig({
                title: form.title || '',
                description: form.description || '',
                submitButtonText: form.submitButtonText || 'Submit',
                successMessage: form.successMessage || 'Thank you for your submission!',
                fields: (form.fields as FormField[]) || [],
              })
            }
          }
        } catch (error) {
          console.error('Failed to load form:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadForm()
    }
  }, [isNew, resolvedParams.id])

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isNew ? generateSlug(name) : formData.slug,
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Form name is required' })
      return
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'Slug is required' })
      return
    }
    if (formConfig.fields.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one field to the form' })
      return
    }

    setMessage(null)
    startTransition(async () => {
      try {
        const data = {
          name: formData.name,
          slug: formData.slug,
          title: formConfig.title || undefined,
          description: formConfig.description || undefined,
          submitButtonText: formConfig.submitButtonText,
          successMessage: formConfig.successMessage,
          fields: formConfig.fields,
          sendEmailNotification: formData.sendEmailNotification,
          notificationEmail: formData.notificationEmail || undefined,
          isActive: formData.isActive,
        }

        if (isNew) {
          const result = await createForm(data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Form created successfully!' })
            router.push('/admin/dashboard/forms')
          }
        } else {
          const result = await updateForm(resolvedParams.id, data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Form updated successfully!' })
          } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update form' })
          }
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save form. Please try again.' })
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteForm(resolvedParams.id)
        if (result.success) {
          router.push('/admin/dashboard/forms')
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to delete form' })
        }
      } catch (error) {
        console.error('Failed to delete:', error)
        setMessage({ type: 'error', text: 'Failed to delete form' })
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
            <Link href="/admin/dashboard/forms" className="hover:text-teal-600">Forms</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">{isNew ? 'New Form' : 'Edit'}</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            {isNew ? 'Create New Form' : 'Edit Form'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isNew ? 'Create Form' : 'Save Changes'}
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Form Builder */}
        <div className="lg:col-span-2">
          <FormBuilder value={formConfig} onChange={setFormConfig} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Form Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Form Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Form Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="e.g., Event RSVP"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{'{{form:'}</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  />
                  <span className="text-gray-400 text-sm">{'}}'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Status</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">Form is active</span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              Inactive forms will not accept submissions
            </p>
          </div>

          {/* Email Notifications */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendEmailNotification}
                  onChange={(e) => setFormData({ ...formData, sendEmailNotification: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">Send email notifications</span>
              </label>

              {formData.sendEmailNotification && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notification Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    placeholder="Leave empty to use default"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Defaults to admin notification email
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Embed Code */}
          {!isNew && formData.slug && (
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Embed This Form</h3>
              <p className="text-sm text-amber-700 mb-3">
                Add this code to your project or blog post content:
              </p>
              <code className="block px-4 py-3 bg-amber-100 rounded-xl text-amber-900 font-mono text-sm break-all">
                {'{{form:' + formData.slug + '}}'}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
