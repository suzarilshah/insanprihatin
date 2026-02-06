'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface StatProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  icon?: React.ReactNode
}

interface ImpactStatFromDB {
  id: string
  label: string
  value: string
  suffix?: string | null
  icon?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
  updatedAt?: Date
}

interface ImpactProps {
  stats?: ImpactStatFromDB[]
}

function AnimatedStat({ value, suffix = '', prefix = '', label, icon }: StatProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    if (value >= 1000000) {
      return `${prefix}${(latest / 1000000).toFixed(1)}M${suffix}`
    }
    if (value >= 1000) {
      return `${prefix}${(latest / 1000).toFixed(0)}K${suffix}`
    }
    return `${prefix}${Math.round(latest)}${suffix}`
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animate(count, value, { duration: 2, ease: 'easeOut' })
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [count, value, hasAnimated])

  return (
    <div ref={ref} className="text-center group">
      <div className="w-20 h-20 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-foundation-charcoal transition-all duration-300">
        {icon}
      </div>
      <motion.div className="font-display text-5xl lg:text-6xl font-bold text-white mb-2">
        {rounded}
      </motion.div>
      <div className="text-white/70 font-medium">{label}</div>
    </div>
  )
}

// Default stats to use when no data from DB
const defaultStats = [
  {
    value: 50000,
    suffix: '+',
    label: 'Lives Impacted',
    icon: (
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    value: 15000000,
    prefix: 'RM ',
    label: 'Total Funds Deployed',
    icon: (
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 120,
    suffix: '+',
    label: 'Projects Completed',
    icon: (
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 45,
    suffix: '+',
    label: 'Partner Organizations',
    icon: (
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
]

// Icon mapping for database-stored icon names
const iconMap: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  currency: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  globe: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  heart: (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

// Default icon when no match found
const defaultIcon = (
  <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

// Helper function to parse value string to number
function parseStatValue(value: string): { numericValue: number; prefix: string } {
  // Remove common prefixes and parse
  const cleanValue = value.replace(/[,\s]/g, '')
  const rmMatch = cleanValue.match(/^RM\s*([\d.]+)([KMB]?)$/i)

  if (rmMatch) {
    let num = parseFloat(rmMatch[1])
    const multiplier = rmMatch[2]?.toUpperCase()
    if (multiplier === 'K') num *= 1000
    if (multiplier === 'M') num *= 1000000
    if (multiplier === 'B') num *= 1000000000
    return { numericValue: num, prefix: 'RM ' }
  }

  // Try parsing with multiplier suffixes
  const numMatch = cleanValue.match(/^([\d.]+)([KMB]?)$/i)
  if (numMatch) {
    let num = parseFloat(numMatch[1])
    const multiplier = numMatch[2]?.toUpperCase()
    if (multiplier === 'K') num *= 1000
    if (multiplier === 'M') num *= 1000000
    if (multiplier === 'B') num *= 1000000000
    return { numericValue: num, prefix: '' }
  }

  // Fallback to direct parse
  return { numericValue: parseFloat(cleanValue) || 0, prefix: '' }
}

export default function Impact({ stats: dbStats }: ImpactProps) {
  // Use database stats if available, otherwise use defaults
  const stats = dbStats && dbStats.length > 0
    ? dbStats.map((stat) => {
        const { numericValue, prefix } = parseStatValue(stat.value)
        return {
          value: numericValue,
          prefix,
          suffix: stat.suffix || '',
          label: stat.label,
          icon: stat.icon ? (iconMap[stat.icon] || defaultIcon) : defaultIcon,
        }
      })
    : defaultStats
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="impact-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#impact-grid)" />
          </svg>
        </div>
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-400/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-amber-400 rounded-full" />
            <span className="text-amber-400 font-medium uppercase tracking-wider text-sm">Our Impact</span>
            <span className="w-3 h-3 bg-amber-400 rounded-full" />
          </div>
          <h2 className="heading-section text-white mb-6">
            Creating Measurable Change
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Every number represents a story of transformation. Our commitment to transparency
            ensures that every contribution creates real, lasting impact.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedStat {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-white/60 mb-6">
            Want to see how we create impact?
          </p>
          <Link
            href="/about#reports"
            className="inline-flex items-center gap-2 text-amber-400 font-medium hover:text-amber-300 transition-colors"
          >
            View Our Annual Reports
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
