'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createProject, updateProject } from '@/lib/actions/projects'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!isNew)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    content: '',
    featuredImage: '',
    category: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    budget: '',
    beneficiaries: '',
    location: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
  })

  useEffect(() => {
    if (!isNew) {
      async function loadProject() {
        try {
          const response = await fetch(`/api/projects/${resolvedParams.id}`)
          if (response.ok) {
            const project = await response.json()
            if (project) {
              setFormData({
                title: project.title || '',
                slug: project.slug || '',
                subtitle: project.subtitle || '',
                description: project.description || '',
                content: project.content || '',
                featuredImage: project.featuredImage || '',
                category: project.category || '',
                status: project.status || 'planned',
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                budget: project.budget || '',
                beneficiaries: project.beneficiaries?.toString() || '',
                location: project.location || '',
                metaTitle: project.metaTitle || '',
                metaDescription: project.metaDescription || '',
                isPublished: project.isPublished || false,
              })
            }
          }
        } catch (error) {
          console.error('Failed to load project:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadProject()
    }
  }, [isNew, resolvedParams.id])

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: isNew ? generateSlug(title) : formData.slug,
    })
  }

  const handleSave = (publish?: boolean) => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'Slug is required' })
      return
    }
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' })
      return
    }

    setMessage(null)
    startTransition(async () => {
      try {
        const data = {
          title: formData.title,
          slug: formData.slug,
          subtitle: formData.subtitle || undefined,
          description: formData.description,
          content: formData.content || undefined,
          featuredImage: formData.featuredImage || undefined,
          category: formData.category || undefined,
          status: formData.status || undefined,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          budget: formData.budget || undefined,
          beneficiaries: formData.beneficiaries ? parseInt(formData.beneficiaries) : undefined,
          location: formData.location || undefined,
          metaTitle: formData.metaTitle || undefined,
          metaDescription: formData.metaDescription || undefined,
          isPublished: publish !== undefined ? publish : formData.isPublished,
        }

        if (isNew) {
          const result = await createProject(data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Project created successfully!' })
            router.push('/admin/dashboard/projects')
          }
        } else {
          const result = await updateProject(resolvedParams.id, data)
          if (result.success) {
            setMessage({ type: 'success', text: 'Project updated successfully!' })
            if (publish !== undefined) {
              setFormData({ ...formData, isPublished: publish })
            }
          }
        }
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save project. Please try again.' })
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
            <Link href="/admin/dashboard/projects" className="hover:text-teal-600">Projects</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">{isNew ? 'New Project' : 'Edit'}</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            {isNew ? 'Create New Project' : 'Edit Project'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave()}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? 'Saving...' : formData.isPublished ? 'Update' : 'Publish'}
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-lg"
                  placeholder="Enter project title"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">/projects/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Brief tagline"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  placeholder="Brief project description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none font-mono text-sm"
                  placeholder="Full project details... (Markdown supported)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Status</h3>
            <div className="space-y-4">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formData.isPublished
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {formData.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Featured Image</h3>
            <input
              type="text"
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              placeholder="Image URL"
            />
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                >
                  <option value="">Select category</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="community">Community</option>
                  <option value="environment">Environment</option>
                  <option value="disaster-relief">Disaster Relief</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="e.g., Kuala Lumpur"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="e.g., RM 50,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Beneficiaries</label>
                <input
                  type="number"
                  value={formData.beneficiaries}
                  onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="Number of people helped"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-medium text-foundation-charcoal mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                  placeholder="SEO title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                  placeholder="SEO description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
