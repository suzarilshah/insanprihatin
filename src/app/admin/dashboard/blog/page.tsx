import { Suspense } from 'react'
import Link from 'next/link'
import { db, blogPosts } from '@/db'
import { desc, sql } from 'drizzle-orm'
import BlogPostsList from './BlogPostsList'

async function getBlogStats() {
  const stats = await db.select({
    total: sql<number>`COUNT(*)`,
    published: sql<number>`COUNT(*) FILTER (WHERE is_published = true)`,
    draft: sql<number>`COUNT(*) FILTER (WHERE is_published = false)`,
  }).from(blogPosts)

  return stats[0]
}

async function getAllPosts() {
  const posts = await db.query.blogPosts.findMany({
    orderBy: [desc(blogPosts.createdAt)],
  })
  return posts
}

export default async function BlogManagement() {
  const stats = await getBlogStats()
  const posts = await getAllPosts()

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Blog Posts</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage Blog Posts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage blog articles and news
          </p>
        </div>
        <Link
          href="/admin/dashboard/blog/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Total Posts</p>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">{Number(stats.total)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Published</p>
          <p className="font-display text-3xl font-bold text-emerald-600">{Number(stats.published)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">Drafts</p>
          <p className="font-display text-3xl font-bold text-amber-600">{Number(stats.draft)}</p>
        </div>
      </div>

      {/* Posts List */}
      <Suspense fallback={<div className="bg-white rounded-2xl p-8 animate-pulse h-64" />}>
        <BlogPostsList initialPosts={posts} />
      </Suspense>
    </div>
  )
}
