import { Suspense } from 'react'
import Link from 'next/link'
import { db, projects } from '@/db'
import { desc, sql } from 'drizzle-orm'
import ProjectsList from './ProjectsList'

async function getProjectStats() {
  const stats = await db.select({
    total: sql<number>`COUNT(*)`,
    published: sql<number>`COUNT(*) FILTER (WHERE is_published = true)`,
    ongoing: sql<number>`COUNT(*) FILTER (WHERE status = 'ongoing')`,
    completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
  }).from(projects)

  return stats[0]
}

async function getAllProjects() {
  const projectsList = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
  })
  return projectsList
}

export default async function ProjectsManagement() {
  const stats = await getProjectStats()
  const projectsList = await getAllProjects()

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Projects</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage Projects
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage community projects
          </p>
        </div>
        <Link
          href="/admin/dashboard/projects/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Total Projects</p>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">{Number(stats.total)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Published</p>
          <p className="font-display text-3xl font-bold text-emerald-600">{Number(stats.published)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Ongoing</p>
          <p className="font-display text-3xl font-bold text-blue-600">{Number(stats.ongoing)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="font-display text-3xl font-bold text-purple-600">{Number(stats.completed)}</p>
        </div>
      </div>

      {/* Projects List */}
      <Suspense fallback={<div className="bg-white rounded-2xl p-8 animate-pulse h-64" />}>
        <ProjectsList initialProjects={projectsList} />
      </Suspense>
    </div>
  )
}
