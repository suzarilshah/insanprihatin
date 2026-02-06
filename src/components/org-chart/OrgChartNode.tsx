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
  isFounder?: boolean // True for top-level members (no parent)
  departmentColor?: string
  showDetails?: boolean
  compact?: boolean // For responsive compact mode
  onMemberClick?: (member: TeamMemberNode) => void
}

const departmentColors: Record<string, string> = {
  'Board of Directors': 'from-amber-500 to-amber-600',
  'Board of Trustees': 'from-amber-500 to-amber-600',
  'Executive Leadership': 'from-teal-500 to-teal-600',
  'Executive': 'from-teal-500 to-teal-600',
  'Management': 'from-sky-500 to-sky-600',
  'Program Management': 'from-sky-500 to-sky-600',
  'Finance & Administration': 'from-emerald-500 to-emerald-600',
  'Finance': 'from-emerald-500 to-emerald-600',
  'Communications & PR': 'from-purple-500 to-purple-600',
  'Communications': 'from-purple-500 to-purple-600',
  'Strategic Partnerships': 'from-rose-500 to-rose-600',
  'Operations': 'from-indigo-500 to-indigo-600',
  'Human Resources': 'from-pink-500 to-pink-600',
}

function getDepartmentColor(department: string | null): string {
  if (!department) return 'from-amber-500 to-amber-600'
  return departmentColors[department] || 'from-slate-500 to-slate-600'
}

export default function OrgChartNode({
  member,
  depth = 0,
  isRoot = false,
  isFounder = false,
  departmentColor,
  showDetails = true,
  compact = false,
  onMemberClick,
}: OrgChartNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(depth > 1) // Auto-collapse deeper levels
  const color = departmentColor || getDepartmentColor(member.department)
  const hasChildren = member.children && member.children.length > 0

  // Toggle collapse
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCollapsed(!isCollapsed)
  }

  // Determine if this is a founder/top-level (should not show department)
  const isTopLevel = isFounder || isRoot || depth === 0

  // Responsive card sizing
  const cardWidth = compact
    ? 'w-[140px] sm:w-[160px]'
    : isRoot
      ? 'w-[180px] sm:w-[220px] lg:w-[260px]'
      : 'w-[140px] sm:w-[160px] lg:w-[180px]'

  const avatarSize = compact
    ? 'w-10 h-10 sm:w-12 sm:h-12'
    : isRoot
      ? 'w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20'
      : 'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14'

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(depth * 0.05, 0.3), duration: 0.3 }}
        className="relative z-10 pb-4" // Added pb-4 to ensure collapse button is visible
        data-member-id={member.id}
      >
        <div
          onClick={() => onMemberClick?.(member)}
          className={`
            relative bg-white rounded-xl overflow-visible cursor-pointer
            border transition-all duration-300
            group
            ${member.additionalManagers && member.additionalManagers.length > 0 ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'}
            ${isRoot ? 'shadow-xl' : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'}
            ${cardWidth}
          `}
        >
          {/* Top color bar */}
          <div className="relative h-1 overflow-hidden rounded-t-xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${color}`} />
          </div>

          {/* Content */}
          <div className={`${compact ? 'p-2 sm:p-3' : isRoot ? 'p-3 sm:p-4' : 'p-2 sm:p-3'} text-center bg-white rounded-b-xl`}>
            {/* Avatar */}
            <div className={`relative mx-auto mb-2 ${avatarSize} transition-transform duration-300 group-hover:scale-105`}>
              <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-br ${color} opacity-20 blur-sm group-hover:opacity-30 transition-opacity`} />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`
                    w-full h-full bg-gradient-to-br ${color}
                    flex items-center justify-center text-white
                    ${isRoot ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} font-bold
                  `}>
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Position */}
            <h3 className={`
              font-semibold text-gray-900 leading-tight mb-0.5 truncate
              ${compact ? 'text-[10px] sm:text-xs' : isRoot ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}
            `}>
              {member.name}
            </h3>
            <p className={`
              text-teal-600 font-medium leading-tight
              ${compact ? 'text-[8px] sm:text-[10px]' : isRoot ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[10px]'}
            `}>
              {member.position}
            </p>

            {/* Department Badge - ONLY show for non-founders/non-top-level */}
            {showDetails && member.department && !isTopLevel && !compact && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 bg-gray-50 rounded-full border border-gray-100 text-[8px] sm:text-[9px] text-gray-500 font-medium truncate max-w-full">
                {member.department}
              </span>
            )}

            {/* Additional Managers Indicator */}
            {member.additionalManagers && member.additionalManagers.length > 0 && !compact && (
              <div className="mt-1 flex items-center justify-center">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 rounded-full border border-purple-100 text-[8px] text-purple-600 font-medium">
                  <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  +{member.additionalManagers.length}
                </span>
              </div>
            )}
          </div>

          {/* Expand/Collapse Button - positioned outside overflow */}
          {hasChildren && (
            <button
              onClick={toggleCollapse}
              className={`
                absolute -bottom-2 left-1/2 -translate-x-1/2
                w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm
                flex items-center justify-center
                text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50
                transition-all z-30
                ${isCollapsed ? 'rotate-0' : 'rotate-180'}
              `}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {/* Children Connection System */}
      <AnimatePresence>
        {hasChildren && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center w-full"
          >
            {/* Vertical line down from parent with arrow */}
            <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400 relative">
              {/* Arrow pointing DOWN to children */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <svg className="w-2 h-2 text-gray-400" viewBox="0 0 8 8" fill="currentColor">
                  <polygon points="4,8 0,2 8,2" />
                </svg>
              </div>
            </div>

            {/* Children Container */}
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 pt-2 relative">
              {member.children?.map((child, index, arr) => {
                const isFirst = index === 0
                const isLast = index === arr.length - 1
                const isOnly = arr.length === 1

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal connector line for this child's section */}
                    {!isOnly && arr.length <= 4 && (
                      <>
                        {/* Line to the left (if not first) */}
                        <div className={`absolute top-0 left-0 w-1/2 h-px bg-gray-300 ${isFirst ? 'hidden' : 'block'}`} />
                        {/* Line to the right (if not last) */}
                        <div className={`absolute top-0 right-0 w-1/2 h-px bg-gray-300 ${isLast ? 'hidden' : 'block'}`} />
                      </>
                    )}

                    {/* Vertical line down to this child */}
                    <div className="w-px h-4 bg-gray-300 mb-1 relative">
                      {!isOnly && arr.length <= 4 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300" />
                      )}
                    </div>

                    <OrgChartNode
                      member={child}
                      depth={depth + 1}
                      isFounder={false}
                      departmentColor={color}
                      showDetails={showDetails}
                      compact={compact || depth > 0}
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
