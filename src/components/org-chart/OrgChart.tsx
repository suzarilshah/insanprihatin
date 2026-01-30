'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import OrgChartNode, { type TeamMemberNode } from './OrgChartNode'

interface OrgChartProps {
  members: TeamMemberNode[]
  variant?: 'tree' | 'grid' | 'department'
  showFilters?: boolean
  onMemberClick?: (member: TeamMemberNode) => void
}

const departmentOrder = [
  'Board of Directors',
  'Board of Trustees',
  'Executive Leadership',
  'Executive',
  'Management',
  'Program Management',
  'Finance & Administration',
  'Finance',
  'Operations',
  'Communications & PR',
  'Communications',
  'Strategic Partnerships',
  'Human Resources',
]

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

// Build tree structure from flat array
function buildTree(members: TeamMemberNode[]): TeamMemberNode[] {
  const memberMap = new Map<string, TeamMemberNode>()
  const roots: TeamMemberNode[] = []

  // Create a map of all members with children arrays
  members.forEach(member => {
    memberMap.set(member.id, { ...member, children: [] })
  })

  // Build the tree structure
  members.forEach(member => {
    const node = memberMap.get(member.id)!
    if (member.parentId && memberMap.has(member.parentId)) {
      const parent = memberMap.get(member.parentId)!
      parent.children = parent.children || []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort children by sortOrder
  const sortChildren = (nodes: TeamMemberNode[]) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    nodes.forEach(node => {
      if (node.children?.length) {
        sortChildren(node.children)
      }
    })
  }

  sortChildren(roots)
  return roots
}

// Group members by department
function groupByDepartment(members: TeamMemberNode[]): Map<string, TeamMemberNode[]> {
  const groups = new Map<string, TeamMemberNode[]>()

  members.forEach(member => {
    const dept = member.department || 'Other'
    if (!groups.has(dept)) {
      groups.set(dept, [])
    }
    groups.get(dept)!.push(member)
  })

  // Sort each department's members
  groups.forEach((deptMembers) => {
    deptMembers.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  })

  // Return sorted by department order
  const sortedGroups = new Map<string, TeamMemberNode[]>()
  departmentOrder.forEach(dept => {
    if (groups.has(dept)) {
      sortedGroups.set(dept, groups.get(dept)!)
    }
  })
  // Add any remaining departments not in the order list
  groups.forEach((members, dept) => {
    if (!sortedGroups.has(dept)) {
      sortedGroups.set(dept, members)
    }
  })

  return sortedGroups
}

export default function OrgChart({
  members,
  variant = 'department',
  showFilters = true,
  onMemberClick,
}: OrgChartProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'department'>(variant)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMemberNode | null>(null)

  // Filter active members only
  const activeMembers = useMemo(() =>
    members.filter(m => m.isActive !== false),
    [members]
  )

  // Build tree structure
  const treeData = useMemo(() => buildTree(activeMembers), [activeMembers])

  // Group by department
  const departmentGroups = useMemo(() => groupByDepartment(activeMembers), [activeMembers])

  // Get unique departments
  const departments = useMemo(() =>
    Array.from(departmentGroups.keys()),
    [departmentGroups]
  )

  // Filter members by selected department
  const filteredMembers = useMemo(() => {
    if (selectedDepartment === 'all') return activeMembers
    return activeMembers.filter(m => m.department === selectedDepartment)
  }, [activeMembers, selectedDepartment])

  const handleMemberClick = (member: TeamMemberNode) => {
    setSelectedMember(member)
    onMemberClick?.(member)
  }

  return (
    <div className="w-full">
      {/* Controls */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { mode: 'department' as const, label: 'By Department', icon: 'grid-3x3' },
              { mode: 'tree' as const, label: 'Hierarchy', icon: 'tree' },
              { mode: 'grid' as const, label: 'Grid', icon: 'grid' },
            ].map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${viewMode === mode
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {icon === 'tree' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )}
                  {icon === 'grid' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                  {icon === 'grid-3x3' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Department Filter - for grid mode */}
          {viewMode === 'grid' && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Departments ({activeMembers.length})</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept} ({departmentGroups.get(dept)?.length || 0})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Department Legend */}
      {(viewMode === 'department' || viewMode === 'tree') && departments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {departments.map((dept, i) => {
            const styles = getDepartmentStyles(dept)
            return (
              <motion.div
                key={dept}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full
                  bg-white border border-gray-200 shadow-sm
                  hover:shadow-md transition-shadow cursor-default
                `}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${styles.gradient}`} />
                <span className="text-sm text-gray-600 font-medium">{dept}</span>
                <span className="text-xs text-gray-400">({departmentGroups.get(dept)?.length || 0})</span>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Tree View */}
      {viewMode === 'tree' && (
        <div className="overflow-x-auto pb-8">
          <div className="flex flex-col items-center gap-6 min-w-max px-4">
            {treeData.map((root, index) => (
              <OrgChartNode
                key={root.id}
                member={root}
                isRoot={index === 0}
                onMemberClick={handleMemberClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Department View */}
      {viewMode === 'department' && (
        <div className="space-y-12">
          {Array.from(departmentGroups.entries()).map(([dept, deptMembers], deptIndex) => {
            const styles = getDepartmentStyles(dept)
            return (
              <motion.div
                key={dept}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: deptIndex * 0.1 }}
              >
                {/* Department Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${styles.gradient}`} />
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foundation-charcoal">
                      {dept}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {deptMembers.length} member{deptMembers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Department Members Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {deptMembers.map((member, memberIndex) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: memberIndex * 0.05 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => handleMemberClick(member)}
                      className="card-elegant overflow-hidden cursor-pointer group"
                    >
                      {/* Top color bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${styles.gradient}`} />

                      <div className="p-6 text-center">
                        {/* Avatar */}
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-elevated">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-white text-xl font-display font-bold`}>
                                {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className="font-heading text-lg font-semibold text-foundation-charcoal group-hover:text-teal-600 transition-colors">
                          {member.name}
                        </h4>
                        <p className="text-teal-600 text-sm font-medium mt-1">
                          {member.position}
                        </p>

                        {/* Contact Icons */}
                        {(member.email || member.linkedin) && (
                          <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title={member.email}
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
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, index) => {
              const styles = getDepartmentStyles(member.department)
              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => handleMemberClick(member)}
                  className="card-elegant overflow-hidden cursor-pointer group"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${styles.gradient}`} />

                  <div className="p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-elevated">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-white text-xl font-display font-bold`}>
                            {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-heading text-lg font-semibold text-foundation-charcoal group-hover:text-teal-600 transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-teal-600 text-sm font-medium mt-1">
                      {member.position}
                    </p>
                    {member.department && (
                      <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 ${styles.bg} rounded-full text-xs ${styles.text} font-medium`}>
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${styles.gradient}`} />
                        {member.department}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-dramatic"
            >
              {/* Header with gradient */}
              <div className={`
                relative h-32 bg-gradient-to-br ${getDepartmentStyles(selectedMember.department).gradient}
              `}>
                <div className="absolute inset-0 bg-dots opacity-20" />
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Avatar */}
              <div className="relative -mt-16 px-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-dramatic">
                    {selectedMember.image ? (
                      <Image
                        src={selectedMember.image}
                        alt={selectedMember.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getDepartmentStyles(selectedMember.department).gradient} flex items-center justify-center text-white text-3xl font-display font-bold`}>
                        {selectedMember.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h3 className="font-heading text-2xl font-semibold text-foundation-charcoal">
                  {selectedMember.name}
                </h3>
                <p className="text-teal-600 font-medium mt-1">
                  {selectedMember.position}
                </p>
                {selectedMember.department && (
                  <span className={`
                    inline-flex items-center gap-2 mt-3 px-4 py-1.5
                    ${getDepartmentStyles(selectedMember.department).bg} rounded-full
                    text-sm ${getDepartmentStyles(selectedMember.department).text} font-medium
                  `}>
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getDepartmentStyles(selectedMember.department).gradient}`} />
                    {selectedMember.department}
                  </span>
                )}

                {selectedMember.bio && (
                  <p className="mt-6 text-gray-600 text-sm leading-relaxed">
                    {selectedMember.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap justify-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>
                  )}
                  {selectedMember.phone && (
                    <a
                      href={`tel:${selectedMember.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {activeMembers.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
            No Team Members Yet
          </h3>
          <p className="text-gray-500">
            Team members will appear here once added.
          </p>
        </div>
      )}
    </div>
  )
}

export { OrgChartNode, type TeamMemberNode }
