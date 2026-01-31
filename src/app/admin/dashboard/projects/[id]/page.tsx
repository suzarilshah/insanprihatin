'use client'

import { useState, useEffect, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createProject, updateProject } from '@/lib/actions/projects'
import ImageUpload from '@/components/admin/ImageUpload'
import FormSelector from '@/components/admin/FormSelector'

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
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)

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
    // Donation configuration
    donationEnabled: false,
    donationGoal: '',
    donationRaised: 0,
    toyyibpayCategoryCode: '',
  })
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

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
                // Donation configuration
                donationEnabled: project.donationEnabled || false,
                donationGoal: project.donationGoal ? (project.donationGoal / 100).toString() : '',
                donationRaised: project.donationRaised || 0,
                toyyibpayCategoryCode: project.toyyibpayCategoryCode || '',
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
          // Donation configuration
          donationEnabled: formData.donationEnabled,
          donationGoal: formData.donationGoal ? Math.round(parseFloat(formData.donationGoal) * 100) : undefined,
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <div className="flex items-center gap-3">
                    <FormSelector
                      onInsert={(embedCode) => {
                        setFormData({
                          ...formData,
                          content: formData.content + '\n\n' + embedCode + '\n',
                        })
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Markdown Help
                    </button>
                  </div>
                </div>

                {showMarkdownHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm"
                  >
                    <h4 className="font-medium text-teal-800 mb-2">Markdown Formatting</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-teal-700">
                      <div><code className="bg-teal-100 px-1 rounded"># Heading 1</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">## Heading 2</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">**bold**</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">*italic*</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">- bullet list</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">1. numbered list</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">[link](url)</code></div>
                      <div><code className="bg-teal-100 px-1 rounded">&gt; blockquote</code></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-teal-200">
                      <h4 className="font-medium text-teal-800 mb-1">Embed Form</h4>
                      <p className="text-teal-700 text-xs mb-1">Add a form anywhere in your content:</p>
                      <code className="bg-teal-100 px-2 py-1 rounded block text-xs">{'{{form:your-form-slug}}'}</code>
                    </div>
                  </motion.div>
                )}

                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none font-mono text-sm"
                  placeholder="Full project details...

# Use Markdown for formatting
Write your content using **bold**, *italic*, lists, and more.

## Embed Forms
To add an RSVP or inquiry form, use: {{form:form-slug}}
Create forms in the Forms section of the admin panel."
                />
              </div>
            </div>
          </div>

          {/* Embedded Form Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-medium text-foundation-charcoal">Embedded Forms</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add RSVP forms, inquiries, or surveys to your project page.
            </p>
            <Link
              href="/admin/dashboard/forms/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Form
            </Link>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Tip:</strong> After creating a form, embed it in your content using <code className="bg-amber-100 px-1 rounded">{'{{form:slug}}'}</code>
              </p>
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

          {/* Donation Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-medium text-foundation-charcoal">Donation Settings</h3>
            </div>

            {/* Enable Donations Toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors mb-4">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${formData.donationEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.donationEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={formData.donationEnabled}
                onChange={(e) => setFormData({ ...formData, donationEnabled: e.target.checked })}
              />
              <div>
                <div className="font-medium text-sm text-gray-900">Enable Donations</div>
                <div className="text-xs text-gray-500">Accept donations for this project</div>
              </div>
            </label>

            {formData.donationEnabled && (
              <div className="space-y-4">
                {/* Donation Goal */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Donation Goal (RM)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                    <input
                      type="number"
                      value={formData.donationGoal}
                      onChange={(e) => setFormData({ ...formData, donationGoal: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                      placeholder="e.g., 50000"
                      min="100"
                      step="100"
                    />
                  </div>
                </div>

                {/* Progress Display (for existing projects) */}
                {!isNew && formData.donationRaised > 0 && (
                  <div className="p-3 bg-teal-50 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-teal-700 font-medium">Raised</span>
                      <span className="text-teal-900 font-bold">
                        RM {(formData.donationRaised / 100).toLocaleString()}
                        {formData.donationGoal && (
                          <span className="font-normal text-teal-600">
                            {' '}/ RM {parseFloat(formData.donationGoal).toLocaleString()}
                          </span>
                        )}
                      </span>
                    </div>
                    {formData.donationGoal && (
                      <div className="h-2 bg-teal-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 transition-all"
                          style={{
                            width: `${Math.min((formData.donationRaised / 100) / parseFloat(formData.donationGoal) * 100, 100)}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ToyyibPay Category Status */}
                {!isNew && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      {formData.toyyibpayCategoryCode ? (
                        <>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-gray-600">Payment category active</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-amber-500 rounded-full" />
                          <span className="text-gray-600">Category will be created on save</span>
                        </>
                      )}
                    </div>
                    {formData.toyyibpayCategoryCode && (
                      <code className="block mt-1 text-xs text-gray-400 font-mono">
                        {formData.toyyibpayCategoryCode}
                      </code>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  When enabled, this project will appear on the donation page and accept contributions via ToyyibPay.
                </p>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <ImageUpload
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              label="Featured Image"
              aspectRatio="video"
              maxSizeMB={10}
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
