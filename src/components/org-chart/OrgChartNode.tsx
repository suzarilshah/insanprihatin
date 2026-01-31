'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

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
}

interface OrgChartNodeProps {
  member: TeamMemberNode
  depth?: number
  isRoot?: boolean
  departmentColor?: string
  showDetails?: boolean
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
  if (!department) return 'from-gray-500 to-gray-600'
  return departmentColors[department] || 'from-slate-500 to-slate-600'
}

export default function OrgChartNode({
  member,
  depth = 0,
  isRoot = false,
  departmentColor,
  showDetails = true,
  onMemberClick,
}: OrgChartNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const color = departmentColor || getDepartmentColor(member.department)
  const hasChildren = member.children && member.children.length > 0
  
  // Toggle collapse
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.1, duration: 0.4 }}
        className="relative z-10"
      >
        <div
          onClick={() => onMemberClick?.(member)}
          className={`
            relative bg-white rounded-2xl overflow-hidden cursor-pointer
            border border-gray-100 transition-all duration-300
            group
            ${isRoot ? 'shadow-2xl scale-105' : 'shadow-elevated hover:shadow-dramatic hover:-translate-y-1'}
            ${isRoot ? 'w-[280px]' : 'w-[220px]'}
          `}
        >
          {/* Top color bar with shimmer effect */}
          <div className="relative h-1.5 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${color}`} />
            <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
          </div>

          {/* Content */}
          <div className={`${isRoot ? 'p-6' : 'p-5'} text-center bg-white`}>
            {/* Avatar with Glow */}
            <div className={`relative mx-auto mb-4 ${isRoot ? 'w-24 h-24' : 'w-16 h-16'} transition-transform duration-300 group-hover:scale-105`}>
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${color} opacity-20 blur-md group-hover:opacity-40 transition-opacity`} />
              <div className={`
                relative w-full h-full rounded-full overflow-hidden
                border-[3px] border-white shadow-sm
              `}>
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
                    ${isRoot ? 'text-2xl' : 'text-lg'} font-display font-bold
                  `}>
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
              </div>

              {/* Status indicator */}
              {member.isActive && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" title="Active" />
              )}
            </div>

            {/* Name & Position */}
            <h3 className={`
              font-heading font-bold text-foundation-charcoal leading-tight mb-1
              ${isRoot ? 'text-lg' : 'text-sm'}
            `}>
              {member.name}
            </h3>
            <p className={`
              text-teal-600 font-medium tracking-wide
              ${isRoot ? 'text-sm' : 'text-xs'}
            `}>
              {member.position}
            </p>

            {/* Department Badge */}
            {showDetails && member.department && (
              <span className={`
                inline-flex items-center gap-1.5 mt-3 px-2.5 py-0.5
                bg-gray-50 rounded-full border border-gray-100
                ${isRoot ? 'text-xs' : 'text-[10px]'} text-gray-500 font-medium
              `}>
                {member.department}
              </span>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={toggleCollapse}
              className={`
                absolute -bottom-3 left-1/2 -translate-x-1/2
                w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md
                flex items-center justify-center
                text-gray-400 hover:text-teal-600 hover:border-teal-200
                transition-all z-20
                ${isCollapsed ? 'rotate-0' : 'rotate-180'}
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex flex-col items-center"
          >
            {/* Vertical line down from parent */}
            <div className="w-px h-8 bg-gray-300 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Horizontal connector line container */}
            <div className="relative flex justify-center px-4">
              {/* The horizontal bar itself */}
              {member.children && member.children.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 mx-[calc(50%/var(--child-count))]">
                  {/* Dynamic width is handled by the container padding/margins naturally in flex, 
                      but for a perfect tree line we need to span from first child center to last child center.
                      Using a simplified approach with border-top on a wrapper div below.
                  */}
                </div>
              )}
              
              {/* We need a specific structure for the lines. 
                  Instead of a single div, let's use the individual child wrappers to create the lines.
              */}
            </div>

            {/* Children Container */}
            <div className="flex pt-4 relative">
              {/* Horizontal line spanning children */}
              {member.children && member.children.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
                   {/* This approach is tricky. Let's use the individual child method: 
                       Each child has a top line. 
                       The parent has a bottom line.
                   */}
                </div>
              )}

              {member.children?.map((child, index, arr) => {
                const isFirst = index === 0
                const isLast = index === arr.length - 1
                const isOnly = arr.length === 1

                return (
                  <div key={child.id} className="flex flex-col items-center px-4 relative">
                    {/* Horizontal connector line for this child's section */}
                    {!isOnly && (
                      <>
                        {/* Line to the left (if not first) */}
                        <div className={`absolute top-0 left-0 w-1/2 h-px bg-gray-300 ${isFirst ? 'hidden' : 'block'}`} />
                        {/* Line to the right (if not last) */}
                        <div className={`absolute top-0 right-0 w-1/2 h-px bg-gray-300 ${isLast ? 'hidden' : 'block'}`} />
                      </>
                    )}
                    
                    {/* Vertical line down to this child */}
                    <div className="w-px h-8 bg-gray-300 -mt-px mb-2 relative">
                       {/* Connector Dot at T-junction */}
                       {!isOnly && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300" />}
                    </div>

                    <OrgChartNode
                      member={child}
                      depth={depth + 1}
                      departmentColor={color}
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
