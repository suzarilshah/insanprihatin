'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getImpactStats, createImpactStat, updateImpactStat, deleteImpactStat } from '@/lib/actions/content'
import BilingualInput, { type LocalizedValue } from '@/components/admin/BilingualInput'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

interface ImpactStat {
  id: string
  label: LocalizedString | string
  value: string
  suffix?: LocalizedString | string | null
  icon?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
}

// Helper to convert LocalizedString to LocalizedValue for the component
const toLocalizedValue = (value: LocalizedString | string | null | undefined): LocalizedValue => {
  if (!value) return { en: '', ms: '' }
  if (typeof value === 'string') return { en: value, ms: value }
  return { en: value.en || '', ms: value.ms || '' }
}

// Helper to get string value from LocalizedString (default to English for admin display)
const getTextValue = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

const iconOptions = [
  { value: 'users', label: 'Users/People' },
  { value: 'currency', label: 'Currency/Money' },
  { value: 'check', label: 'Checkmark/Completed' },
  { value: 'globe', label: 'Globe/Partners' },
  { value: 'heart', label: 'Heart/Care' },
]

export default function EditImpactStats() {
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<ImpactStat[]>([])
  const [editingStat, setEditingStat] = useState<ImpactStat | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    label: { en: '', ms: '' } as LocalizedValue,
    value: '',
    suffix: { en: '', ms: '' } as LocalizedValue,
    icon: 'users',
    sortOrder: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const data = await getImpactStats()
      setStats(data as ImpactStat[])
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        if (editingStat) {
          const result = await updateImpactStat(editingStat.id, {
            label: formData.label,
            value: formData.value,
            suffix: formData.suffix,
            icon: formData.icon,
            sortOrder: formData.sortOrder,
          })
          if (result.success) {
            setMessage({ type: 'success', text: 'Stat updated successfully!' })
          }
        } else {
          const result = await createImpactStat({
            label: formData.label,
            value: formData.value,
            suffix: formData.suffix,
            icon: formData.icon,
            sortOrder: formData.sortOrder,
          })
          if (result.success) {
            setMessage({ type: 'success', text: 'Stat created successfully!' })
          }
        }
        setShowForm(false)
        setEditingStat(null)
        setFormData({ label: { en: '', ms: '' }, value: '', suffix: { en: '', ms: '' }, icon: 'users', sortOrder: 0 })
        loadStats()
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
      }
    })
  }

  const handleEdit = (stat: ImpactStat) => {
    setEditingStat(stat)
    setFormData({
      label: toLocalizedValue(stat.label),
      value: stat.value,
      suffix: toLocalizedValue(stat.suffix),
      icon: stat.icon || 'users',
      sortOrder: stat.sortOrder || 0,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this stat?')) return

    startTransition(async () => {
      try {
        const result = await deleteImpactStat(id)
        if (result.success) {
          setMessage({ type: 'success', text: 'Stat deleted successfully!' })
          loadStats()
        }
      } catch (error) {
        console.error('Failed to delete:', error)
        setMessage({ type: 'error', text: 'Failed to delete stat.' })
      }
    })
  }

  const handleAddNew = () => {
    setEditingStat(null)
    setFormData({ label: { en: '', ms: '' }, value: '', suffix: { en: '', ms: '' }, icon: 'users', sortOrder: stats.length })
    setShowForm(true)
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
            <Link href="/admin/dashboard/content" className="hover:text-teal-600">Content</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Impact Statistics</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage Impact Statistics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add stats in both English and Bahasa Melayu
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Statistic
        </button>
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

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 lg:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl font-semibold text-foundation-charcoal mb-6">
              {editingStat ? 'Edit Statistic' : 'Add New Statistic'}
            </h2>

            <div className="space-y-5">
              <BilingualInput
                label="Label"
                value={formData.label}
                onChange={(value) => setFormData({ ...formData, label: value })}
                placeholder={{ en: 'e.g., Lives Impacted', ms: 'cth., Nyawa Terkesan' }}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., 50000 or RM 15M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <BilingualInput
                label="Suffix"
                value={formData.suffix}
                onChange={(value) => setFormData({ ...formData, suffix: value })}
                placeholder={{ en: 'e.g., +', ms: 'cth., +' }}
                helperText="Optional suffix shown after the value (e.g., '+' for '15K+')"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !formData.label.en || !formData.value}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-medium">
                {stat.icon || 'users'}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(stat)}
                  className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(stat.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-foundation-charcoal mb-1">
              {stat.value}{getTextValue(stat.suffix)}
            </div>
            <div className="text-gray-500 text-sm">{getTextValue(stat.label)}</div>
          </motion.div>
        ))}

        {stats.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 mb-4">No impact statistics yet</p>
            <button onClick={handleAddNew} className="btn-primary">
              Add Your First Statistic
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
