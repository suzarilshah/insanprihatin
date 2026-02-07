'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getGlossaryTerms,
  getGlossaryStats,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  seedGlossary,
  type GlossaryTerm,
} from '@/lib/actions/glossary'
import {
  getTranslationFeedback,
  getTranslationFeedbackStats,
  reviewTranslationFeedback,
  deleteTranslationFeedback,
  type TranslationFeedbackItem,
} from '@/lib/actions/translation-feedback'

type TabType = 'overview' | 'feedback' | 'glossary'

export default function TranslationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([])
  const [feedbackItems, setFeedbackItems] = useState<TranslationFeedbackItem[]>([])
  const [glossaryStats, setGlossaryStats] = useState<{ total: number; active: number; byContext: Record<string, number> } | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<{ total: number; pending: number; applied: number; dismissed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [contextFilter, setContextFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null)
  const [seeding, setSeeding] = useState(false)

  // Form state for new/edit glossary term
  const [formData, setFormData] = useState({
    termEn: '',
    termMs: '',
    context: 'general',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [terms, stats, feedback, fbStats] = await Promise.all([
        getGlossaryTerms({ search: searchTerm || undefined, context: contextFilter || undefined }),
        getGlossaryStats(),
        getTranslationFeedback({ limit: 50 }),
        getTranslationFeedbackStats(),
      ])
      setGlossaryTerms(terms)
      setGlossaryStats(stats)
      setFeedbackItems(feedback)
      setFeedbackStats(fbStats)
    } catch (error) {
      console.error('Failed to load translation data:', error)
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    const terms = await getGlossaryTerms({ search: searchTerm || undefined, context: contextFilter || undefined })
    setGlossaryTerms(terms)
  }

  const handleAddTerm = async () => {
    if (!formData.termEn || !formData.termMs) return

    const result = await createGlossaryTerm(formData)
    if (result.success) {
      setShowAddModal(false)
      setFormData({ termEn: '', termMs: '', context: 'general', notes: '' })
      loadData()
    } else {
      alert(result.error || 'Failed to add term')
    }
  }

  const handleUpdateTerm = async () => {
    if (!editingTerm || !formData.termEn || !formData.termMs) return

    const result = await updateGlossaryTerm(editingTerm.id, formData)
    if (result.success) {
      setEditingTerm(null)
      setFormData({ termEn: '', termMs: '', context: 'general', notes: '' })
      loadData()
    } else {
      alert(result.error || 'Failed to update term')
    }
  }

  const handleDeleteTerm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this glossary term?')) return

    const result = await deleteGlossaryTerm(id)
    if (result.success) {
      loadData()
    }
  }

  const handleSeedGlossary = async () => {
    if (!confirm('This will add 50+ NGO-specific terms to your glossary. Terms that already exist will be skipped. Continue?')) return

    setSeeding(true)
    const result = await seedGlossary()
    setSeeding(false)

    if (result.success) {
      alert(`Added ${result.added} new terms. ${result.skipped} already existed.`)
      loadData()
    }
  }

  const handleReviewFeedback = async (id: string, status: 'applied' | 'dismissed') => {
    const result = await reviewTranslationFeedback(id, { status })
    if (result.success) {
      loadData()
    }
  }

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return

    const result = await deleteTranslationFeedback(id)
    if (result.success) {
      loadData()
    }
  }

  const openEditModal = (term: GlossaryTerm) => {
    setEditingTerm(term)
    setFormData({
      termEn: term.termEn,
      termMs: term.termMs,
      context: term.context || 'general',
      notes: term.notes || '',
    })
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      id: 'glossary',
      label: 'Glossary',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ]

  const contextOptions = [
    { value: 'general', label: 'General' },
    { value: 'donation', label: 'Donation' },
    { value: 'project', label: 'Project' },
    { value: 'about', label: 'About' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading translations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Translation Management</h1>
          <p className="text-gray-500 mt-1">Manage glossary terms and review translation feedback</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.id === 'feedback' && feedbackStats && feedbackStats.pending > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                  {feedbackStats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Glossary Terms</p>
                    <p className="text-2xl font-semibold text-gray-900">{glossaryStats?.total || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Feedback</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackStats?.pending || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied Fixes</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackStats?.applied || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Feedback</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackStats?.total || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('glossary')}
                  className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Glossary Term
                </button>
                <button
                  onClick={handleSeedGlossary}
                  disabled={seeding}
                  className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {seeding ? (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  Seed NGO Terms
                </button>
                {feedbackStats && feedbackStats.pending > 0 && (
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Review {feedbackStats.pending} Pending
                  </button>
                )}
              </div>
            </div>

            {/* Glossary by Context */}
            {glossaryStats && Object.keys(glossaryStats.byContext).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Glossary by Context</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(glossaryStats.byContext).map(([context, count]) => (
                    <div key={context} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 capitalize">{context}</p>
                      <p className="text-xl font-semibold text-gray-900">{count} terms</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {feedbackItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-gray-500">No translation feedback yet</p>
                <p className="text-sm text-gray-400 mt-1">Feedback will appear here when submitted through content editors</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {feedbackItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{item.contentType}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.contentId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{item.field}</p>
                          <p className="text-xs text-gray-500">{item.sourceLanguage} → {item.targetLanguage}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            item.feedbackType === 'incorrect' ? 'bg-red-100 text-red-700' :
                            item.feedbackType === 'awkward' ? 'bg-amber-100 text-amber-700' :
                            item.feedbackType === 'grammar' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.feedbackType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'applied' ? 'bg-green-100 text-green-700' :
                            item.status === 'dismissed' ? 'bg-gray-100 text-gray-500' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleReviewFeedback(item.id, 'applied')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Mark as Applied"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleReviewFeedback(item.id, 'dismissed')}
                                  className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                                  title="Dismiss"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteFeedback(item.id)}
                              className="p-1 text-red-400 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'glossary' && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search terms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={contextFilter}
                onChange={(e) => {
                  setContextFilter(e.target.value)
                  setTimeout(handleSearch, 0)
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">All Contexts</option>
                {contextOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Term
              </button>
            </div>

            {/* Glossary Table */}
            {glossaryTerms.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500">No glossary terms yet</p>
                <p className="text-sm text-gray-400 mt-1">Add custom terms or seed with NGO-specific vocabulary</p>
                <button
                  onClick={handleSeedGlossary}
                  disabled={seeding}
                  className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Seed NGO Terms
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">English</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bahasa Melayu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {glossaryTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{term.termEn}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{term.termMs}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                            {term.context || 'general'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            term.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {term.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(term)}
                              className="p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(term.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingTerm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddModal(false)
              setEditingTerm(null)
              setFormData({ termEn: '', termMs: '', context: 'general', notes: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTerm ? 'Edit Glossary Term' : 'Add Glossary Term'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English Term</label>
                  <input
                    type="text"
                    value={formData.termEn}
                    onChange={(e) => setFormData({ ...formData, termEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., Foundation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa Melayu Term</label>
                  <input
                    type="text"
                    value={formData.termMs}
                    onChange={(e) => setFormData({ ...formData, termMs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., Yayasan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                  <select
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {contextOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    rows={2}
                    placeholder="Usage notes or context..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingTerm(null)
                    setFormData({ termEn: '', termMs: '', context: 'general', notes: '' })
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTerm ? handleUpdateTerm : handleAddTerm}
                  disabled={!formData.termEn || !formData.termMs}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTerm ? 'Update' : 'Add'} Term
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
