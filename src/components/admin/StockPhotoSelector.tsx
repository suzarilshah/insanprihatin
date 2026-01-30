'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface StockPhoto {
  id: string
  description: string | null
  altDescription: string | null
  urls: {
    thumb: string
    small: string
    regular: string
    full: string
  }
  user: {
    name: string
    link: string
  }
  downloadLocation: string
  width: number
  height: number
  color: string
}

interface StockPhotoSelectorProps {
  onSelect: (url: string) => void
}

export default function StockPhotoSelector({ onSelect }: StockPhotoSelectorProps) {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<StockPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const searchPhotos = useCallback(async (searchQuery: string, pageNum: number, append = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        perPage: '12',
      })
      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim())
      }

      const response = await fetch(`/api/stock-photos/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photos')
      }

      if (append) {
        setPhotos(prev => [...prev, ...data.photos])
      } else {
        setPhotos(data.photos)
      }
      setTotalPages(data.totalPages)
      setHasMore(pageNum < data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    searchPhotos('', 1)
  }, [searchPhotos])

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      searchPhotos(value, 1)
    }, 300)
  }

  // Load more photos
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    searchPhotos(query, nextPage, true)
  }

  // Download and select photo
  const handleSelectPhoto = async (photo: StockPhoto) => {
    if (downloading) return

    setDownloading(photo.id)
    setError(null)

    try {
      const response = await fetch('/api/stock-photos/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: photo.id,
          downloadLocation: photo.downloadLocation,
          imageUrl: photo.urls.regular,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download photo')
      }

      onSelect(data.fileUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download photo')
    } finally {
      setDownloading(null)
    }
  }

  // Popular searches for empty state
  const popularSearches = ['nature', 'technology', 'business', 'community', 'education', 'healthcare']

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search free high-resolution photos..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && !downloading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Popular Searches */}
      {!query && photos.length === 0 && !loading && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                setPage(1)
                searchPhotos(term, 1)
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      )}

      {/* Photo Grid */}
      <div className="max-h-[400px] overflow-y-auto rounded-xl">
        {loading && photos.length === 0 ? (
          // Loading Skeletons
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-4xl mb-3">&#128247;</div>
            <p className="text-gray-500 text-sm">
              {query ? `No photos found for "${query}"` : 'Search for photos to get started'}
            </p>
          </div>
        ) : (
          // Photo Grid
          <>
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence mode="popLayout">
                {photos.map((photo, index) => (
                  <motion.button
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleSelectPhoto(photo)}
                    disabled={!!downloading}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      downloading === photo.id ? 'ring-2 ring-teal-500' : ''
                    }`}
                    style={{ backgroundColor: photo.color }}
                  >
                    <Image
                      src={photo.urls.small}
                      alt={photo.altDescription || photo.description || 'Stock photo'}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 33vw, 150px"
                    />

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity ${
                      downloading === photo.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[10px] truncate">
                          by {photo.user.name}
                        </p>
                      </div>
                    </div>

                    {/* Downloading Indicator */}
                    {downloading === photo.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-white text-xs font-medium">Downloading...</span>
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load more photos'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Attribution */}
      <p className="text-[10px] text-gray-400 text-center">
        Photos provided by{' '}
        <a
          href="https://unsplash.com/?utm_source=insanprihatin&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-teal-600"
        >
          Unsplash
        </a>
      </p>
    </div>
  )
}
