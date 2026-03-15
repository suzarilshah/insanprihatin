'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import StockPhotoSelector from './StockPhotoSelector'

interface InlineImagePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
}

type Tab = 'upload' | 'url' | 'stock'

export default function InlineImagePicker({
  isOpen,
  onClose,
  onSelect,
}: InlineImagePickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (PNG, JPG, GIF, WebP)'
    }
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > 10) {
      return 'File size must be less than 10MB'
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

    // Simulate progress
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

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Small delay to show 100%
      setTimeout(() => {
        onSelect(data.fileUrl)
        resetState()
      }, 300)
    } catch (err) {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
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

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Please enter an image URL')
      return
    }

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    onSelect(urlInput.trim())
    resetState()
  }

  const handleStockPhotoSelect = (url: string) => {
    onSelect(url)
    resetState()
  }

  const resetState = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
    setUrlInput('')
    setPreviewUrl(null)
    setActiveTab('upload')
  }

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose])

  // Preview URL image
  const handleUrlPreview = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim())
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foundation-charcoal">
              Insert Image
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Add an image to your content
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'upload' as Tab, label: 'Upload', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )},
            { id: 'stock' as Tab, label: 'Stock Photos', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )},
            { id: 'url' as Tab, label: 'From URL', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'text-teal-600 bg-teal-50 border-b-2 border-teal-500 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative aspect-video border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                    isDragging
                      ? 'bg-teal-50 border-teal-400'
                      : 'bg-gray-50 border-gray-200 hover:border-teal-400 hover:bg-teal-50/30'
                  } ${isUploading ? 'pointer-events-none' : ''}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    {isUploading ? (
                      <>
                        <div className="w-16 h-16 mb-4 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                        <p className="text-gray-600 text-sm mb-2">Uploading... {uploadProgress}%</p>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-teal-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                          <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium mb-1">
                          {isDragging ? 'Drop your image here' : 'Drag and drop your image'}
                        </p>
                        <p className="text-gray-500 text-sm mb-3">
                          or <span className="text-teal-600 font-medium">click to browse</span>
                        </p>
                        <p className="text-gray-400 text-xs">
                          PNG, JPG, GIF, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick tips */}
                <div className="mt-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <h4 className="text-sm font-medium text-teal-700 mb-2">Tips for best results</h4>
                  <ul className="text-xs text-teal-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Use high-resolution images (at least 1200px wide)
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Optimize images for web (WebP format recommended)
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Drag the image block in the editor to reposition it
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'stock' && (
              <motion.div
                key="stock"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <StockPhotoSelector onSelect={handleStockPhotoSelect} />
              </motion.div>
            )}

            {activeTab === 'url' && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value)
                        setError(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <button
                      onClick={handleUrlPreview}
                      disabled={!urlInput.trim()}
                      className="px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {/* URL Preview */}
                {previewUrl && (
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      onError={() => {
                        setError('Failed to load image from URL')
                        setPreviewUrl(null)
                      }}
                    />
                  </div>
                )}

                {/* Insert Button */}
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="w-full px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Insert Image
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Make sure you have permission to use this image
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
