'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, getDepartments, getPotentialParents } from '@/lib/actions/team'
import ImageUpload from '@/components/admin/ImageUpload'
import { OrgChart } from '@/components/org-chart'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

type TeamMember = {
  id: string
  name: string
  position: LocalizedString | string
  department: string | null
  bio: LocalizedString | string | null
  image: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  sortOrder: number | null
  parentId: string | null
  isActive: boolean
}

// Helper to get string value from localized field (default to English for admin)
const getPosition = (position: LocalizedString | string): string => {
  if (typeof position === 'string') return position
  return getLocalizedValue(position, 'en')
}

const getBio = (bio: LocalizedString | string | null): string | null => {
  if (!bio) return null
  if (typeof bio === 'string') return bio
  return getLocalizedValue(bio, 'en')
}

const departmentColors: Record<string, { gradient: string; bg: string; text: string }> = {
  'Board of Directors': { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Board of Trustees': { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Executive Leadership': { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-700' },
  'Executive': { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-700' },
  'Management': { gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-700' },
  'Program Management': { gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-700' },
  'Finance & Administration': { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Finance': { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Operations': { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  'Communications & PR': { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Communications': { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Strategic Partnerships': { gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700' },
  'Human Resources': { gradient: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700' },
}

function getDepartmentStyles(department: string | null) {
  if (!department) return { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' }
  return departmentColors[department] || { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', text: 'text-slate-700' }
}

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [potentialParents, setPotentialParents] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'chart'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    bio: '',
    image: '',
    email: '',
    phone: '',
    linkedin: '',
    sortOrder: 0,
    parentId: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [membersData, deptsData] = await Promise.all([
          getTeamMembers(),
          getDepartments(),
        ])
        setMembers(membersData as TeamMember[])
        setDepartments(deptsData as string[])
      } catch (error) {
        console.error('Failed to load team data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Load potential parents when editing
  useEffect(() => {
    async function loadParents() {
      const parents = await getPotentialParents(editingMember?.id)
      setPotentialParents(parents as TeamMember[])
    }
    if (isCreating || editingMember) {
      loadParents()
    }
  }, [isCreating, editingMember])

  const filteredMembers = useMemo(() => {
    let result = members

    // Filter by department
    if (filterDept !== 'all') {
      result = result.filter(m => m.department === filterDept)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        getPosition(m.position).toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query)
      )
    }

    return result
  }, [members, filterDept, searchQuery])

  // Statistics
  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.isActive).length,
    departments: new Set(members.map(m => m.department).filter(Boolean)).size,
    withReports: members.filter(m => members.some(child => child.parentId === m.id)).length,
  }), [members])

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      bio: '',
      image: '',
      email: '',
      phone: '',
      linkedin: '',
      sortOrder: 0,
      parentId: '',
    })
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      position: getPosition(member.position),
      department: member.department || '',
      bio: getBio(member.bio) || '',
      image: member.image || '',
      email: member.email || '',
      phone: member.phone || '',
      linkedin: member.linkedin || '',
      sortOrder: member.sortOrder || 0,
      parentId: member.parentId || '',
    })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingMember(null)
    resetForm()
    setIsCreating(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.position.trim()) return

    startTransition(async () => {
      try {
        const dataToSave = {
          ...formData,
          parentId: formData.parentId || undefined,
        }

        if (editingMember) {
          await updateTeamMember(editingMember.id, dataToSave)
          setMembers(members.map(m =>
            m.id === editingMember.id ? { ...m, ...dataToSave, parentId: dataToSave.parentId || null } : m
          ))
        } else {
          const result = await createTeamMember(dataToSave)
          if (result.member) {
            setMembers([...members, result.member as TeamMember])
            if (formData.department && !departments.includes(formData.department)) {
              setDepartments([...departments, formData.department])
            }
          }
        }
        setEditingMember(null)
        setIsCreating(false)
        resetForm()
      } catch (error) {
        console.error('Failed to save:', error)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTeamMember(id)
      setMembers(members.filter(m => m.id !== id))
      setDeleteConfirm(null)
    })
  }

  const handleToggleActive = (member: TeamMember) => {
    startTransition(async () => {
      await updateTeamMember(member.id, { isActive: !member.isActive })
      setMembers(members.map(m =>
        m.id === member.id ? { ...m, isActive: !m.isActive } : m
      ))
    })
  }

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null
    const parent = members.find(m => m.id === parentId)
    return parent?.name || null
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Team & Organization</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Team Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your organization&apos;s team members and hierarchy
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/about#leadership"
            target="_blank"
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Link>
          <button
            onClick={handleCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Members', value: stats.total, icon: '👥', color: 'teal' },
          { label: 'Active', value: stats.active, icon: '✓', color: 'emerald' },
          { label: 'Departments', value: stats.departments, icon: '🏢', color: 'sky' },
          { label: 'With Reports', value: stats.withReports, icon: '📊', color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-foundation-charcoal mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full lg:w-80 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { mode: 'grid' as const, icon: 'grid' },
              { mode: 'list' as const, icon: 'list' },
              { mode: 'chart' as const, icon: 'chart' },
            ].map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${viewMode === mode
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                {icon === 'grid' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
                {icon === 'list' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
                {icon === 'chart' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="all">All Departments ({members.length})</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept} ({members.filter(m => m.department === dept).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Org Chart View */}
      {viewMode === 'chart' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
        >
          <OrgChart
            members={members as Parameters<typeof OrgChart>[0]['members']}
            variant="department"
            showFilters={false}
            onMemberClick={(member) => handleEdit(member as TeamMember)}
          />
        </motion.div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, index) => {
              const styles = getDepartmentStyles(member.department)
              const parentName = getParentName(member.parentId)

              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  className={`bg-white rounded-2xl overflow-hidden border ${member.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'} hover:shadow-lg transition-all group`}
                >
                  {/* Color Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${styles.gradient}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${styles.gradient} text-white font-bold text-xl`}>
                            {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foundation-charcoal">{member.name}</h3>
                    <p className="text-sm text-teal-600 font-medium">{getPosition(member.position)}</p>

                    {member.department && (
                      <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 ${styles.bg} rounded-full text-xs ${styles.text} font-medium`}>
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${styles.gradient}`} />
                        {member.department}
                      </span>
                    )}

                    {parentName && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Reports to: {parentName}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <div className="flex gap-1">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Member</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Department</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Reports To</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 hidden sm:table-cell">Contact</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredMembers.map((member) => {
                  const styles = getDepartmentStyles(member.department)
                  const parentName = getParentName(member.parentId)

                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-gray-50 transition-colors ${!member.isActive ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${styles.gradient} text-white font-bold text-sm`}>
                                {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foundation-charcoal">{member.name}</p>
                            <p className="text-sm text-gray-500">{getPosition(member.position)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {member.department && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${styles.bg} rounded-full text-xs ${styles.text} font-medium`}>
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${styles.gradient}`} />
                            {member.department}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {parentName ? (
                          <span className="text-sm text-gray-600">{parentName}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex gap-2">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title={member.email}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </a>
                          )}
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title={member.phone}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            member.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(member.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {filteredMembers.length === 0 && viewMode !== 'chart' && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-500 mb-2">
            {searchQuery ? 'No members match your search' : 'No team members found'}
          </p>
          <button onClick={handleCreate} className="text-teal-600 font-medium hover:text-teal-700">
            Add your first team member
          </button>
        </div>
      )}

      {/* M365 Integration Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 2.5H2.5V11.5H11.5V2.5Z" />
                <path d="M21.5 2.5H12.5V11.5H21.5V2.5Z" />
                <path d="M11.5 12.5H2.5V21.5H11.5V12.5Z" />
                <path d="M21.5 12.5H12.5V21.5H21.5V12.5Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Microsoft 365 Integration</h3>
              <p className="text-blue-100 text-sm">
                Sync your org chart automatically with Microsoft 365 Entra ID
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full">Coming Soon</span>
          </div>
        </div>
      </motion.div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {(editingMember || isCreating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setEditingMember(null); setIsCreating(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-dramatic"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-semibold text-foundation-charcoal">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => { setEditingMember(null); setIsCreating(false) }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Executive Director"
                    />
                  </div>
                </div>

                {/* Department & Reports To */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="e.g., Executive Leadership"
                      list="departments"
                    />
                    <datalist id="departments">
                      {departments.map(d => <option key={d} value={d} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reports To</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    >
                      <option value="">No one (Top Level)</option>
                      {potentialParents.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {getPosition(p.position)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-colors"
                    placeholder="Brief description about this person..."
                  />
                </div>

                {/* Photo */}
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Photo"
                  aspectRatio="square"
                  maxSizeMB={5}
                />

                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                </div>

                {/* LinkedIn & Sort Order */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => { setEditingMember(null); setIsCreating(false) }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending || !formData.name.trim() || !formData.position.trim()}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Member'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-dramatic"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
                  Remove Team Member?
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  This action cannot be undone. The member will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                >
                  {isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
