import { Suspense } from 'react'
import Link from 'next/link'
import { db, donations, contactSubmissions, projects, blogPosts, teamMembers } from '@/db'
import { eq, desc, sql } from 'drizzle-orm'

async function getDashboardStats() {
  // Get total donations
  const donationsResult = await db.select({
    total: sql<number>`COALESCE(SUM(amount), 0)`,
    count: sql<number>`COUNT(*)`,
  }).from(donations).where(eq(donations.paymentStatus, 'completed'))

  // Get active projects
  const projectsResult = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(projects).where(eq(projects.isPublished, true))

  // Get unread messages
  const messagesResult = await db.select({
    total: sql<number>`COUNT(*)`,
    unread: sql<number>`COUNT(*) FILTER (WHERE is_read = false)`,
  }).from(contactSubmissions)

  // Get blog posts
  const blogResult = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(blogPosts).where(eq(blogPosts.isPublished, true))

  // Get team members
  const teamResult = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(teamMembers).where(eq(teamMembers.isActive, true))

  return {
    totalDonations: Number(donationsResult[0]?.total || 0) / 100, // Convert from cents
    donationCount: Number(donationsResult[0]?.count || 0),
    activeProjects: Number(projectsResult[0]?.count || 0),
    totalMessages: Number(messagesResult[0]?.total || 0),
    unreadMessages: Number(messagesResult[0]?.unread || 0),
    publishedPosts: Number(blogResult[0]?.count || 0),
    teamMembers: Number(teamResult[0]?.count || 0),
  }
}

async function getRecentActivity() {
  // Get recent donations
  const recentDonations = await db.query.donations.findMany({
    orderBy: [desc(donations.createdAt)],
    limit: 3,
  })

  // Get recent messages
  const recentMessages = await db.query.contactSubmissions.findMany({
    orderBy: [desc(contactSubmissions.createdAt)],
    limit: 3,
  })

  // Combine and sort
  const activities = [
    ...recentDonations.map(d => ({
      type: 'donation' as const,
      message: `${d.isAnonymous ? 'Anonymous' : d.donorName} donated RM ${(d.amount / 100).toLocaleString()}`,
      time: d.createdAt,
    })),
    ...recentMessages.map(m => ({
      type: 'message' as const,
      message: `New message from ${m.name}: "${m.subject || 'No subject'}"`,
      time: m.createdAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  return activities
}

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function StatsCard({ label, value, subtext, icon, color }: {
  label: string
  value: string
  subtext?: string
  icon: React.ReactNode
  color: 'teal' | 'amber' | 'purple' | 'blue'
}) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-foundation-charcoal">{value}</p>
          {subtext && (
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()
  const activities = await getRecentActivity()

  return (
    <>
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Donations"
          value={`RM ${stats.totalDonations.toLocaleString()}`}
          subtext={`${stats.donationCount} donations`}
          color="teal"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Active Projects"
          value={stats.activeProjects.toString()}
          subtext="Currently running"
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatsCard
          label="Messages"
          value={stats.totalMessages.toString()}
          subtext={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'All read'}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          label="Team Members"
          value={stats.teamMembers.toString()}
          subtext={`${stats.publishedPosts} blog posts`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Add New Project', icon: '📦', href: '/admin/dashboard/projects/new', desc: 'Create a new community project' },
              { label: 'Write Blog Post', icon: '✏️', href: '/admin/dashboard/blog/new', desc: 'Share updates and news' },
              { label: 'Update Hero Section', icon: '🖼️', href: '/admin/dashboard/content/hero', desc: 'Edit homepage banner' },
              { label: 'View All Donations', icon: '💰', href: '/admin/dashboard/donations', desc: 'Track all contributions' },
              { label: 'Manage Team', icon: '👥', href: '/admin/dashboard/team', desc: 'Update org chart' },
              { label: 'Check Messages', icon: '📬', href: '/admin/dashboard/messages', desc: `${stats.unreadMessages} unread` },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <span className="font-medium text-foundation-charcoal group-hover:text-teal-600 block">
                    {action.label}
                  </span>
                  <span className="text-sm text-gray-500">{action.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'donation'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {activity.type === 'donation' ? '💰' : '✉️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foundation-charcoal line-clamp-2">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            )}
          </div>
          {activities.length > 0 && (
            <Link
              href="/admin/dashboard/messages"
              className="block text-center text-teal-600 text-sm font-medium mt-4 hover:text-teal-700"
            >
              View all activity
            </Link>
          )}
        </div>
      </div>

      {/* Content Overview */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/dashboard/content" className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow">
          <h3 className="font-heading text-lg font-semibold mb-2">Site Content</h3>
          <p className="text-teal-100 text-sm mb-4">Edit hero, about, and other page sections</p>
          <span className="text-sm font-medium flex items-center gap-2">
            Manage Content
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link href="/admin/dashboard/projects" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow">
          <h3 className="font-heading text-lg font-semibold mb-2">Projects</h3>
          <p className="text-blue-100 text-sm mb-4">{stats.activeProjects} active community projects</p>
          <span className="text-sm font-medium flex items-center gap-2">
            View Projects
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link href="/admin/dashboard/blog" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow">
          <h3 className="font-heading text-lg font-semibold mb-2">Blog</h3>
          <p className="text-purple-100 text-sm mb-4">{stats.publishedPosts} published articles</p>
          <span className="text-sm font-medium flex items-center gap-2">
            Manage Blog
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </>
  )
}

function LoadingStats() {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-64 animate-pulse" />
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-64 animate-pulse" />
      </div>
    </>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<LoadingStats />}>
      <DashboardContent />
    </Suspense>
  )
}
