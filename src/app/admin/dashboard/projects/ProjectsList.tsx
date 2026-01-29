'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteProject, updateProject } from '@/lib/actions/projects'

type Project = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  category: string | null
  status: string | null
  isPublished: boolean | null
  beneficiaries: number | null
  createdAt: Date
}

const statusColors: Record<string, string> = {
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  planned: 'bg-amber-100 text-amber-700',
}

export default function ProjectsList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && project.isPublished) ||
      (filter === 'draft' && !project.isPublished)
    return matchesSearch && matchesFilter
  })

  const handleTogglePublish = (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus
    startTransition(async () => {
      await updateProject(id, { isPublished: newStatus })
      setProjects(projects.map(p => p.id === id ? { ...p, isPublished: newStatus } : p))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
      setDeleteConfirm(null)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  {project.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                      {project.status}
                    </span>
                  )}
                  <button
                    onClick={() => handleTogglePublish(project.id, project.isPublished)}
                    disabled={isPending}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      project.isPublished
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {project.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/dashboard/projects/${project.id}`}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <Link href={`/admin/dashboard/projects/${project.id}`}>
                <h3 className="font-medium text-foundation-charcoal hover:text-teal-600 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.subtitle}</p>
                )}
              </Link>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                {project.category && (
                  <span className="text-xs text-gray-500">{project.category}</span>
                )}
                {project.beneficiaries && (
                  <span className="text-xs text-gray-500">{project.beneficiaries.toLocaleString()} beneficiaries</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found</p>
          <Link href="/admin/dashboard/projects/new" className="text-teal-600 font-medium mt-2 inline-block hover:text-teal-700">
            Create your first project
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                Delete Project?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone. The project will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
