'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getStockPhotoSettings, updateStockPhotoSettings } from '@/lib/actions/stock-photos'
import {
  STOCK_PHOTO_LOCATIONS,
  CURATED_STOCK_PHOTOS,
  type StockPhotoSettings,
  type StockPhotoLocation,
  type StockPhotoCategory,
} from '@/lib/stock-photo-config'

// Map locations to suggested categories
const LOCATION_CATEGORIES: Record<StockPhotoLocation, StockPhotoCategory> = {
  heroBackground: 'charity',
  heroCommunity: 'community',
  solutionFeatured: 'education',
  solutionProject1: 'projects',
  solutionProject2: 'projects',
}

export default function StockPhotosPage() {
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState<StockPhotoSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<StockPhotoLocation | null>(null)
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getStockPhotoSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSelectPhoto = (location: StockPhotoLocation, url: string) => {
    if (!settings) return
    setSettings({ ...settings, [location]: url })
    setSelectedLocation(null)
    setCustomUrl('')
  }

  const handleSave = () => {
    if (!settings) return
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await updateStockPhotoSettings(settings)
        if (result.success) {
          setMessage({ type: 'success', text: 'Stock photo settings saved successfully!' })
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
        }
      } catch (error) {
        console.error('Save error:', error)
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/dashboard/content" className="hover:text-teal-600">Content</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Stock Photos</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Stock Photo Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage default stock images used across the website
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Stock Photo Locations */}
      <div className="grid gap-6">
        {(Object.keys(STOCK_PHOTO_LOCATIONS) as StockPhotoLocation[]).map((location) => {
          const config = STOCK_PHOTO_LOCATIONS[location]
          const currentUrl = settings[location]

          return (
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Current Image Preview */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100">
                    {currentUrl ? (
                      <Image
                        src={currentUrl}
                        alt={config.label}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info and Controls */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foundation-charcoal">
                        {config.label}
                      </h3>
                      <p className="text-sm text-gray-500">{config.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 rounded">{config.aspectRatio}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">{config.recommended}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Component: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{config.component}</code>
                  </p>

                  {/* Current URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current URL</label>
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => setSettings({ ...settings, [location]: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="Enter image URL or select from below"
                    />
                  </div>

                  <button
                    onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    {selectedLocation === location ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Suggestions
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Show Stock Photo Suggestions
                      </>
                    )}
                  </button>

                  {/* Curated Options */}
                  <AnimatePresence>
                    {selectedLocation === location && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Suggested Photos ({LOCATION_CATEGORIES[location]})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {CURATED_STOCK_PHOTOS[LOCATION_CATEGORIES[location]].map((photo, index) => (
                              <button
                                key={index}
                                onClick={() => handleSelectPhoto(location, photo.url)}
                                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                  currentUrl === photo.url
                                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                                    : 'border-transparent hover:border-gray-300'
                                }`}
                              >
                                <Image
                                  src={photo.url}
                                  alt={photo.label}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {currentUrl === photo.url && (
                                  <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                  <span className="text-xs text-white truncate block">{photo.label}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Show all categories */}
                          <details className="mt-4">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-teal-600">
                              Browse all categories
                            </summary>
                            <div className="mt-3 space-y-4">
                              {(Object.keys(CURATED_STOCK_PHOTOS) as StockPhotoCategory[])
                                .filter((cat) => cat !== LOCATION_CATEGORIES[location])
                                .map((category) => (
                                  <div key={category}>
                                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                      {category}
                                    </h5>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                      {CURATED_STOCK_PHOTOS[category].map((photo, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleSelectPhoto(location, photo.url)}
                                          className={`relative aspect-video rounded-lg overflow-hidden border transition-all hover:scale-105 ${
                                            currentUrl === photo.url
                                              ? 'border-teal-500'
                                              : 'border-gray-200 hover:border-gray-300'
                                          }`}
                                        >
                                          <Image
                                            src={photo.url}
                                            alt={photo.label}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </details>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
        <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips
        </h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>Use high-quality images for better visual impact</li>
          <li>Unsplash images are free to use and optimized for web</li>
          <li>You can also use custom URLs from your Media Library</li>
          <li>Changes will apply to fallback images only - if content has specific images set, those take priority</li>
        </ul>
      </div>
    </div>
  )
}
