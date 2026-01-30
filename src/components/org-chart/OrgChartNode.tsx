'use client'

import { motion } from 'framer-motion'
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
  const color = departmentColor || getDepartmentColor(member.department)
  const hasChildren = member.children && member.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.1, duration: 0.4 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => onMemberClick?.(member)}
        className={`
          relative bg-white rounded-2xl overflow-hidden cursor-pointer
          border border-gray-100 transition-all duration-300
          ${isRoot ? 'shadow-dramatic' : 'shadow-elevated hover:shadow-dramatic'}
          ${isRoot ? 'min-w-[280px] max-w-[320px]' : 'min-w-[200px] max-w-[240px]'}
        `}
      >
        {/* Top color bar */}
        <div className={`h-1.5 bg-gradient-to-r ${color}`} />

        {/* Content */}
        <div className={`${isRoot ? 'p-6' : 'p-4'} text-center`}>
          {/* Avatar */}
          <div className={`relative mx-auto mb-4 ${isRoot ? 'w-24 h-24' : 'w-16 h-16'}`}>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-20`} />
            <div className={`
              relative w-full h-full rounded-full overflow-hidden
              border-4 border-white shadow-elevated
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
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Name & Position */}
          <h3 className={`
            font-heading font-semibold text-foundation-charcoal
            ${isRoot ? 'text-lg' : 'text-sm'}
          `}>
            {member.name}
          </h3>
          <p className={`text-teal-600 font-medium ${isRoot ? 'text-sm' : 'text-xs'} mt-1`}>
            {member.position}
          </p>

          {showDetails && member.department && (
            <span className={`
              inline-flex items-center gap-1.5 mt-2 px-2.5 py-1
              bg-gray-50 rounded-full
              ${isRoot ? 'text-xs' : 'text-[10px]'} text-gray-500 font-medium
            `}>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${color}`} />
              {member.department}
            </span>
          )}

          {/* Contact Icons - Only for root/main leaders */}
          {showDetails && isRoot && (member.email || member.linkedin) && (
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
                  title="LinkedIn Profile"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title={member.phone}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Children Connection Line */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical line down from parent */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: depth * 0.1 + 0.2, duration: 0.3 }}
            className="w-0.5 h-8 bg-gradient-to-b from-teal-300 to-teal-400 origin-top"
          />

          {/* Horizontal connector line */}
          {member.children && member.children.length > 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: depth * 0.1 + 0.3, duration: 0.4 }}
              className="h-0.5 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 origin-center"
              style={{
                width: `calc(${(member.children.length - 1) * 100}% + ${(member.children.length - 1) * 2}rem)`,
                maxWidth: '100%',
              }}
            />
          )}

          {/* Children Container */}
          <div className="flex flex-wrap justify-center gap-6 mt-0">
            {member.children?.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line to each child */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: depth * 0.1 + 0.4 + index * 0.1, duration: 0.3 }}
                  className="w-0.5 h-6 bg-gradient-to-b from-teal-400 to-teal-300 origin-top"
                />
                <OrgChartNode
                  member={child}
                  depth={depth + 1}
                  departmentColor={color}
                  showDetails={showDetails}
                  onMemberClick={onMemberClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
