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

function StatsCard({ label, value, subtext }: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
      <p className="text-gray-500 text-sm font-medium mb-2">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</p>
      {subtext && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Active
          </span>
          <span className="text-xs text-gray-500">{subtext}</span>
        </div>
      )}
    </div>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()
  const activities = await getRecentActivity()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500">Key performance metrics for the foundation.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Donations"
          value={`RM ${stats.totalDonations.toLocaleString()}`}
          subtext={`${stats.donationCount} contributions`}
        />
        <StatsCard
          label="Active Projects"
          value={stats.activeProjects.toString()}
          subtext="Running campaigns"
        />
        <StatsCard
          label="Messages"
          value={stats.totalMessages.toString()}
          subtext={`${stats.unreadMessages} unread`}
        />
        <StatsCard
          label="Team Members"
          value={stats.teamMembers.toString()}
          subtext={`${stats.publishedPosts} blog posts`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'New Project', icon: 'M12 4v16m8-8H4', href: '/admin/dashboard/projects/new', desc: 'Launch a campaign' },
              { label: 'Write Article', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', href: '/admin/dashboard/blog/new', desc: 'Publish updates' },
              { label: 'View Donations', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', href: '/admin/dashboard/donations', desc: 'Track funds' },
              { label: 'Check Inbox', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', href: '/admin/dashboard/messages', desc: 'Read messages' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-gray-900 block mb-0.5">
                    {action.label}
                  </span>
                  <span className="text-sm text-gray-500">{action.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 flex gap-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      activity.type === 'donation' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 font-mono">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            )}
            {activities.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/admin/dashboard/messages"
                  className="block text-center text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingStats() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<LoadingStats />}>
      <DashboardContent />
    </Suspense>
  )
}
