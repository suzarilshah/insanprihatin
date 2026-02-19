'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SEOPreviewProps {
  title: string
  description: string
  slug: string
  baseUrl?: string
}

export default function SEOPreview({
  title,
  description,
  slug,
  baseUrl = 'insanprihatin.org',
}: SEOPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Truncate for Google preview
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title
  const displayDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  const displayUrl = `${baseUrl}/blog/${slug}`

  // Score calculations
  const titleScore = title.length >= 30 && title.length <= 60 ? 100 : title.length < 30 ? 50 : 70
  const descScore = description.length >= 120 && description.length <= 160 ? 100 : description.length < 120 ? 50 : 70
  const slugScore = slug && !slug.includes(' ') && slug.length <= 50 ? 100 : 50
  const overallScore = Math.round((titleScore + descScore + slugScore) / 3)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50'
    if (score >= 50) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Needs Work'
    return 'Poor'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foundation-charcoal">SEO Preview</h3>
            <p className="text-xs text-gray-500">How your post appears in search results</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score Badge */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(overallScore)}`}>
            {overallScore}% {getScoreLabel(overallScore)}
          </div>

          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Google Preview */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">Google Search Result</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 truncate">{displayUrl}</p>
                  <h4 className="text-lg text-blue-700 hover:underline cursor-pointer font-medium">
                    {displayTitle || 'Your page title will appear here'}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {displayDescription || 'Your meta description will appear here. Make it compelling to increase click-through rates.'}
                  </p>
                </div>
              </div>

              {/* Social Preview */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">Social Media Preview</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="aspect-[1.91/1] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Featured Image</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400 uppercase">{baseUrl}</p>
                    <h4 className="font-medium text-foundation-charcoal text-sm mt-1 line-clamp-1">
                      {title || 'Post title'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {description || 'Post description'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">SEO Score Breakdown</p>

                {/* Title Score */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Title Length</span>
                      <span className="text-xs text-gray-400">{title.length}/60 chars</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(title.length / 60 * 100, 100)}%` }}
                        className={`h-full rounded-full ${
                          titleScore >= 80 ? 'bg-emerald-500' : titleScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getScoreColor(titleScore)}`}>
                    {titleScore}%
                  </span>
                </div>

                {/* Description Score */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Description Length</span>
                      <span className="text-xs text-gray-400">{description.length}/160 chars</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(description.length / 160 * 100, 100)}%` }}
                        className={`h-full rounded-full ${
                          descScore >= 80 ? 'bg-emerald-500' : descScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getScoreColor(descScore)}`}>
                    {descScore}%
                  </span>
                </div>

                {/* URL Score */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">URL Structure</span>
                      <span className="text-xs text-gray-400">{slug.length} chars</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${slugScore}%` }}
                        className={`h-full rounded-full ${
                          slugScore >= 80 ? 'bg-emerald-500' : slugScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getScoreColor(slugScore)}`}>
                    {slugScore}%
                  </span>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-medium text-blue-800 mb-2">💡 SEO Tips</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  {title.length < 30 && <li>• Title is too short. Aim for 30-60 characters.</li>}
                  {title.length > 60 && <li>• Title is too long. It may be truncated in search results.</li>}
                  {description.length < 120 && <li>• Description is too short. Aim for 120-160 characters.</li>}
                  {description.length > 160 && <li>• Description is too long. It will be truncated.</li>}
                  {!slug && <li>• Add a URL slug for better SEO.</li>}
                  {slug.includes(' ') && <li>• URL slug should not contain spaces.</li>}
                  {overallScore >= 80 && <li>• Great job! Your SEO is well optimized.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
