'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, getDepartments } from '@/lib/actions/team'

type TeamMember = {
  id: string
  name: string
  position: string
  department: string | null
  bio: string | null
  image: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  sortOrder: number | null
  isActive: boolean
}

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState<string>('all')

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

  const filteredMembers = filterDept === 'all'
    ? members
    : members.filter(m => m.department === filterDept)

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
    })
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      position: member.position,
      department: member.department || '',
      bio: member.bio || '',
      image: member.image || '',
      email: member.email || '',
      phone: member.phone || '',
      linkedin: member.linkedin || '',
      sortOrder: member.sortOrder || 0,
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
        if (editingMember) {
          await updateTeamMember(editingMember.id, formData)
          setMembers(members.map(m =>
            m.id === editingMember.id ? { ...m, ...formData } : m
          ))
        } else {
          const result = await createTeamMember(formData)
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
            <span className="text-foundation-charcoal">Team</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage Team
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your organization's team members
          </p>
        </div>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterDept('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filterDept === 'all'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({members.length})
        </button>
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterDept === dept
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white rounded-2xl p-4 border ${member.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'} hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(member.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="font-medium text-foundation-charcoal">{member.name}</h3>
              <p className="text-sm text-teal-600">{member.position}</p>
              {member.department && (
                <p className="text-xs text-gray-500 mt-1">{member.department}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleToggleActive(member)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    member.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.isActive ? 'Active' : 'Inactive'}
                </button>
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No team members found</p>
          <button onClick={handleCreate} className="text-teal-600 font-medium mt-2 hover:text-teal-700">
            Add your first team member
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {(editingMember || isCreating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setEditingMember(null); setIsCreating(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., Board of Directors, Management"
                    list="departments"
                  />
                  <datalist id="departments">
                    {departments.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setEditingMember(null); setIsCreating(false); }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending || !formData.name.trim() || !formData.position.trim()}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save'}
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
                Remove Team Member?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone.
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
