'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { uploadFile, getFileUrl, deleteFile } from '@/lib/appwrite'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
  maxSizeMB?: number
  className?: string
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Click to upload or drag and drop',
  aspectRatio = 'video',
  maxSizeMB = 10,
  className = '',
}: ImageUploadProps) {
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

    // Simulate progress for UX (Appwrite doesn't provide progress events in web SDK)
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
      const fileId = await uploadFile(file)
      const fileUrl = getFileUrl(fileId)

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
      onChange(fileUrl)

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
      console.error('Upload failed:', err)
      setError('Upload failed. Please try again.')
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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

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
        // Upload mode
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative ${aspectRatioClasses[aspectRatio]} border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
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
                <div className="w-12 h-12 mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
