'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PublishSchedulerProps {
  isPublished: boolean
  publishedAt: Date | null
  scheduledFor: Date | null
  onPublish: () => void
  onUnpublish: () => void
  onSchedule: (date: Date) => void
  onCancelSchedule: () => void
  isPending?: boolean
}

export default function PublishScheduler({
  isPublished,
  publishedAt,
  scheduledFor,
  onPublish,
  onUnpublish,
  onSchedule,
  onCancelSchedule,
  isPending = false,
}: PublishSchedulerProps) {
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const handleSchedule = () => {
    if (scheduleDate && scheduleTime) {
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      if (dateTime > new Date()) {
        onSchedule(dateTime)
        setShowScheduler(false)
        setScheduleDate('')
        setScheduleTime('')
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isPublished
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : scheduledFor
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : 'bg-gradient-to-br from-amber-500 to-amber-600'
          }`}>
            {isPublished ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : scheduledFor ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-foundation-charcoal">Publishing</h3>
            <p className="text-xs text-gray-500">
              {isPublished
                ? `Published ${publishedAt ? formatDate(publishedAt) : 'now'}`
                : scheduledFor
                ? `Scheduled for ${formatDate(scheduledFor)}`
                : 'Draft - not visible to public'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${
            isPublished
              ? 'bg-emerald-100 text-emerald-700'
              : scheduledFor
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isPublished
                ? 'bg-emerald-500'
                : scheduledFor
                ? 'bg-blue-500 animate-pulse'
                : 'bg-amber-500'
            }`} />
            {isPublished ? 'Published' : scheduledFor ? 'Scheduled' : 'Draft'}
          </span>
        </div>

        {/* Scheduled Info */}
        {scheduledFor && !isPublished && (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-800 font-medium">Scheduled to publish</p>
                <p className="text-blue-600">{formatDate(scheduledFor)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancelSchedule}
              disabled={isPending}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Cancel Schedule
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isPublished && !scheduledFor && (
            <>
              <button
                type="button"
                onClick={onPublish}
                disabled={isPending}
                className="w-full px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isPending ? 'Publishing...' : 'Publish Now'}
              </button>

              <button
                type="button"
                onClick={() => setShowScheduler(true)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Schedule for Later
              </button>
            </>
          )}

          {isPublished && (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isPending}
              className="w-full px-4 py-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              {isPending ? 'Unpublishing...' : 'Unpublish'}
            </button>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduler && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScheduler(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foundation-charcoal">
                    Schedule Publication
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose when to publish this post
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={minDate}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {scheduleDate && scheduleTime && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Publish at:</span>{' '}
                      {formatDate(new Date(`${scheduleDate}T${scheduleTime}`))}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduler(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
