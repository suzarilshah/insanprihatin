'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export type ReportType = 'direct' | 'dotted' | 'functional' | 'project'

export type AdditionalManager = {
  id: string
  managerId: string
  reportType: ReportType
  notes: string | null
}

export type TeamMemberNode = {
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
  parentId: string | null
  isActive: boolean | null
  children?: TeamMemberNode[]
  additionalManagers?: AdditionalManager[]
}

interface OrgChartNodeProps {
  member: TeamMemberNode
  depth?: number
  isRoot?: boolean
  isFounder?: boolean
  showDetails?: boolean
  onMemberClick?: (member: TeamMemberNode) => void
}

// Department colors - each department gets its own color scheme
const departmentStyles: Record<string, { gradient: string; bg: string; border: string; text: string }> = {
  'Board of Directors': { gradient: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  'Board of Trustees': { gradient: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  'Executive Leadership': { gradient: 'from-teal-400 to-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
  'Executive': { gradient: 'from-teal-400 to-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
  'Management': { gradient: 'from-sky-400 to-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  'Program Management': { gradient: 'from-sky-400 to-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  'Finance & Administration': { gradient: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Finance': { gradient: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Communications & PR': { gradient: 'from-purple-400 to-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Communications': { gradient: 'from-purple-400 to-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Strategic Partnerships': { gradient: 'from-rose-400 to-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  'Operations': { gradient: 'from-indigo-400 to-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  'Human Resources': { gradient: 'from-pink-400 to-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
}

function getDepartmentStyles(department: string | null) {
  if (!department) return { gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' }
  return departmentStyles[department] || { gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' }
}

export default function OrgChartNode({
  member,
  depth = 0,
  isRoot = false,
  isFounder = false,
  showDetails = true,
  onMemberClick,
}: OrgChartNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(depth > 2) // Auto-collapse very deep levels
  const styles = getDepartmentStyles(member.department)
  const hasChildren = member.children && member.children.length > 0

  // Toggle collapse
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCollapsed(!isCollapsed)
  }

  // Determine if this is a founder/top-level (should not show department badge)
  const isTopLevel = isFounder || isRoot || depth === 0

  // Card sizing - ENLARGED
  const cardWidth = isRoot
    ? 'w-[200px] sm:w-[240px] lg:w-[280px]'
    : 'w-[160px] sm:w-[180px] lg:w-[200px]'

  const avatarSize = isRoot
    ? 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
    : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16'

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(depth * 0.05, 0.3), duration: 0.3 }}
        className="relative z-10 pb-5"
        data-member-id={member.id}
      >
        <div
          onClick={() => onMemberClick?.(member)}
          className={`
            relative rounded-2xl overflow-visible cursor-pointer
            border-2 transition-all duration-300
            group
            ${styles.border} ${styles.bg}
            ${isRoot ? 'shadow-xl' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'}
            ${cardWidth}
          `}
        >
          {/* Top color bar */}
          <div className="relative h-2 overflow-hidden rounded-t-xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient}`} />
          </div>

          {/* Content */}
          <div className={`${isRoot ? 'p-4 sm:p-5' : 'p-3 sm:p-4'} text-center`}>
            {/* Avatar */}
            <div className={`relative mx-auto mb-3 ${avatarSize} transition-transform duration-300 group-hover:scale-105`}>
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${styles.gradient} opacity-30 blur-md group-hover:opacity-40 transition-opacity`} />
              <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-white shadow-md">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`
                    w-full h-full bg-gradient-to-br ${styles.gradient}
                    flex items-center justify-center text-white
                    ${isRoot ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-bold
                  `}>
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Position */}
            <h3 className={`
              font-bold text-gray-900 leading-tight mb-1
              ${isRoot ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}
            `}>
              {member.name}
            </h3>
            <p className={`
              ${styles.text} font-semibold leading-tight
              ${isRoot ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}
            `}>
              {member.position}
            </p>

            {/* Department Badge - ONLY show for non-founders/non-top-level */}
            {showDetails && member.department && !isTopLevel && (
              <span className={`
                inline-flex items-center gap-1 mt-2 px-2 py-0.5
                bg-white/60 rounded-full border ${styles.border}
                text-[9px] sm:text-[10px] ${styles.text} font-medium
              `}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${styles.gradient}`} />
                {member.department}
              </span>
            )}

            {/* Additional Managers Indicator */}
            {member.additionalManagers && member.additionalManagers.length > 0 && (
              <div className="mt-2 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/80 rounded-full border border-gray-200 text-[9px] sm:text-[10px] text-gray-600 font-medium">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  +{member.additionalManagers.length} manager{member.additionalManagers.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={toggleCollapse}
              className={`
                absolute -bottom-3 left-1/2 -translate-x-1/2
                w-6 h-6 rounded-full bg-white border-2 ${styles.border} shadow-md
                flex items-center justify-center
                ${styles.text} hover:bg-gray-50
                transition-all z-30
                ${isCollapsed ? 'rotate-0' : 'rotate-180'}
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {/* Children Connection System - Clean elbow-style connectors */}
      <AnimatePresence>
        {hasChildren && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center w-full"
          >
            {/* Vertical line down from parent - clean, no arrow */}
            <div className="w-[2px] h-6 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full" />

            {/* Children Container */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 relative">
              {member.children?.map((child, index, arr) => {
                const isFirst = index === 0
                const isLast = index === arr.length - 1
                const isOnly = arr.length === 1

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal connector segments - only for multiple children */}
                    {!isOnly && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] flex">
                        {/* Left segment - hidden for first child */}
                        <div className={`flex-1 bg-gray-300 ${isFirst ? 'invisible' : ''}`} />
                        {/* Right segment - hidden for last child */}
                        <div className={`flex-1 bg-gray-300 ${isLast ? 'invisible' : ''}`} />
                      </div>
                    )}

                    {/* Vertical connector to each child */}
                    <div className={`w-[2px] bg-gray-300 rounded-b-full ${isOnly ? 'h-4' : 'h-5'}`} />

                    {/* Small circle junction point for multiple children */}
                    {!isOnly && (
                      <div className="w-2 h-2 rounded-full bg-gray-400 border-2 border-white shadow-sm -mt-0.5 mb-1 z-10" />
                    )}

                    <OrgChartNode
                      member={child}
                      depth={depth + 1}
                      isFounder={false}
                      showDetails={showDetails}
                      onMemberClick={onMemberClick}
                    />
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
