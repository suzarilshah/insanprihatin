'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteFile } from '@/lib/appwrite'
import StockPhotoSelector from './StockPhotoSelector'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
  maxSizeMB?: number
  className?: string
  showStockPhotos?: boolean
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
}

type Tab = 'upload' | 'stock'

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Click to upload or drag and drop',
  aspectRatio = 'video',
  maxSizeMB = 10,
  className = '',
  showStockPhotos = true,
}: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract file ID from Appwrite URL for deletion
  const extractFileId = (url: string): string | null => {
    if (!url) return null
    const match = url.match(/\/files\/([a-zA-Z0-9]+)\//)
    return match ? match[1] : null
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (PNG, JPG, GIF, WebP)'
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 150)

    try {
      // Use server-side API for upload (avoids CORS/permission issues)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // If there was a previous image, try to delete it
      const previousFileId = extractFileId(value)
      if (previousFileId) {
        try {
          await deleteFile(previousFileId)
        } catch {
          // Silently fail if deletion fails (file might not exist)
          console.log('Previous file deletion failed, continuing...')
        }
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      onChange(data.fileUrl)

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemove = async () => {
    const fileId = extractFileId(value)
    if (fileId) {
      try {
        await deleteFile(fileId)
      } catch {
        console.log('File deletion failed, continuing...')
      }
    }
    onChange('')
  }

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleStockPhotoSelect = (url: string) => {
    // Delete previous image if exists
    const previousFileId = extractFileId(value)
    if (previousFileId) {
      deleteFile(previousFileId).catch(() => {
        console.log('Previous file deletion failed, continuing...')
      })
    }
    onChange(url)
    setActiveTab('upload') // Switch back to upload tab to show preview
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {value ? (
        // Preview mode
        <div className="relative group">
          <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded-xl overflow-hidden`}>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
              onError={() => setError('Failed to load image preview')}
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Replace image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                title="View full size"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ) : (
        // Upload/Stock mode with tabs
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Tab Header */}
          {showStockPhotos && (
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'upload'
                    ? 'text-teal-600 bg-teal-50 border-b-2 border-teal-500 -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'stock'
                    ? 'text-teal-600 bg-teal-50 border-b-2 border-teal-500 -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Stock Photos
              </button>
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  onClick={handleClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative ${aspectRatioClasses[aspectRatio]} transition-all cursor-pointer ${
                    isDragging
                      ? 'bg-teal-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } ${isUploading ? 'pointer-events-none' : ''}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {isUploading ? (
                      // Upload progress
                      <>
                        <div className="w-12 h-12 mb-3 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                        <p className="text-gray-600 text-sm mb-2">Uploading... {uploadProgress}%</p>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      // Default upload UI
                      <>
                        <div className="w-12 h-12 mb-3 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-gray-600 text-sm text-center">
                          <span className="text-teal-600 font-medium">Click to upload</span>
                          <br />
                          <span className="text-gray-400">or drag and drop</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          PNG, JPG, GIF, WebP up to {maxSizeMB}MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stock"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="p-4"
              >
                <StockPhotoSelector onSelect={handleStockPhotoSelect} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* URL fallback input */}
      <div className="mt-3">
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Or enter URL manually
          </summary>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
            disabled={isUploading}
          />
        </details>
      </div>
    </div>
  )
}
