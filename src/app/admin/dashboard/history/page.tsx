'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentVersion {
  id: string
  contentType: string
  contentId: string
  versionNumber: number
  data: Record<string, unknown>
  changeType: string
  changeSummary: string | null
  changedFields: string[] | null
  changedBy: string | null
  changedByEmail: string | null
  changedByName: string | null
  createdAt: string
}

interface ActivityLogEntry {
  id: string
  eventType: string
  eventDescription: string
  contentType: string | null
  contentId: string | null
  contentTitle: string | null
  userId: string | null
  userEmail: string | null
  userName: string | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface VersionStats {
  totalVersions: number
  versionsByType: Record<string, number>
  recentActivity: ActivityLogEntry[]
}

const contentTypeLabels: Record<string, string> = {
  blog_posts: 'Blog Posts',
  projects: 'Projects',
  team_members: 'Team Members',
  hero_content: 'Hero Section',
  about_content: 'About Section',
  impact_stats: 'Impact Stats',
  partners: 'Partners',
  testimonials: 'Testimonials',
  faqs: 'FAQs',
  pages: 'Pages',
  site_settings: 'Site Settings',
}

const changeTypeColors: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  restore: 'bg-purple-100 text-purple-700',
  publish: 'bg-teal-100 text-teal-700',
  unpublish: 'bg-amber-100 text-amber-700',
}

function formatRelativeTime(date: string) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function VersionHistoryPage() {
  const [stats, setStats] = useState<VersionStats | null>(null)
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [selectedContentType, setSelectedContentType] = useState<string>('')
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [])

  useEffect(() => {
    if (selectedContentType) {
      fetchVersionsByType(selectedContentType)
    }
  }, [selectedContentType])

  async function fetchStats() {
    try {
      const res = await fetch('/api/versions?type=stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function fetchActivity() {
    try {
      const res = await fetch('/api/versions?type=activity&limit=20')
      const data = await res.json()
      setActivity(data)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchVersionsByType(contentType: string) {
    try {
      const res = await fetch(`/api/versions?type=versions&contentType=${contentType}`)
      const data = await res.json()
      setVersions(data)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    }
  }

  async function handleRestore(version: ContentVersion) {
    if (!confirm(`Are you sure you want to restore this ${contentTypeLabels[version.contentType] || version.contentType} to version ${version.versionNumber}? This will overwrite the current content.`)) {
      return
    }

    setRestoring(true)
    try {
      const res = await fetch(`/api/versions/${version.id}`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to restore')
      }

      alert('Content restored successfully!')
      fetchActivity()
      if (selectedContentType) {
        fetchVersionsByType(selectedContentType)
      }
    } catch (error) {
      console.error('Failed to restore:', error)
      alert('Failed to restore content. Please try again.')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32" />
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Versions</p>
              <p className="font-display text-2xl font-bold text-foundation-charcoal">
                {stats?.totalVersions || 0}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(stats?.versionsByType || {}).slice(0, 3).map(([type, count]) => (
          <div key={type} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{contentTypeLabels[type] || type}</p>
                <p className="font-display text-2xl font-bold text-foundation-charcoal">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {activity.length > 0 ? (
              activity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    changeTypeColors[entry.eventType.replace('content_', '').replace('settings_', '')] || 'bg-gray-100 text-gray-700'
                  }`}>
                    {entry.eventType.replace('content_', '').replace('settings_', '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foundation-charcoal font-medium">
                      {entry.eventDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{entry.userName || entry.userEmail || 'System'}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(entry.createdAt)}</span>
                      {entry.contentType && (
                        <>
                          <span>•</span>
                          <span className="text-teal-600">{contentTypeLabels[entry.contentType] || entry.contentType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
            )}
          </div>
        </div>

        {/* Content Type Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
            Browse by Content Type
          </h2>
          <div className="space-y-2">
            {Object.entries(contentTypeLabels).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedContentType(value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedContentType === value
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  {stats?.versionsByType?.[value] && (
                    <span className="text-xs text-gray-500">{stats.versionsByType[value]} versions</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Version List */}
      <AnimatePresence>
        {selectedContentType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal">
                {contentTypeLabels[selectedContentType]} Versions
              </h2>
              <button
                onClick={() => setSelectedContentType('')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filter
              </button>
            </div>

            {versions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Content ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Version</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Change</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Summary</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Changed By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((version) => (
                      <tr key={version.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                          {version.contentId.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                            v{version.versionNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                            changeTypeColors[version.changeType] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {version.changeType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {version.changeSummary || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {version.changedByName || version.changedByEmail || 'System'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(version.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedVersion(version)}
                              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                            >
                              View
                            </button>
                            {version.changeType !== 'delete' && (
                              <button
                                onClick={() => handleRestore(version)}
                                disabled={restoring}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No versions found for this content type</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Detail Modal */}
      <AnimatePresence>
        {selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVersion(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foundation-charcoal">
                    Version {selectedVersion.versionNumber}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {contentTypeLabels[selectedVersion.contentType] || selectedVersion.contentType} • {formatDate(selectedVersion.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    changeTypeColors[selectedVersion.changeType] || 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedVersion.changeType}
                  </span>
                  {selectedVersion.changeSummary && (
                    <span className="text-sm text-gray-600">{selectedVersion.changeSummary}</span>
                  )}
                </div>

                {selectedVersion.changedFields && selectedVersion.changedFields.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Changed Fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.changedFields.map((field) => (
                        <span key={field} className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Version Data:</p>
                  <pre className="bg-gray-50 rounded-xl p-4 text-xs overflow-x-auto">
                    {JSON.stringify(selectedVersion.data, null, 2)}
                  </pre>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedVersion(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  {selectedVersion.changeType === 'delete' && (
                    <button
                      onClick={() => {
                        handleRestore(selectedVersion)
                        setSelectedVersion(null)
                      }}
                      disabled={restoring}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {restoring ? 'Restoring...' : 'Restore This Version'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
