'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadFile, getFileUrl, deleteFile, listFiles, type AppwriteFile } from '@/lib/appwrite'

// Appwrite configuration for display
const APPWRITE_PROJECT = 'insanprihatin'
const APPWRITE_BUCKET = 'yip-bucket'

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  createdAt: string
}

export default function MediaLibrary() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [totalFiles, setTotalFiles] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const filesPerPage = 20

  // Load files from Appwrite
  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listFiles(filesPerPage, currentPage * filesPerPage)
      const mediaFiles: MediaFile[] = response.files.map((file: AppwriteFile) => ({
        id: file.$id,
        name: file.name,
        url: getFileUrl(file.$id),
        type: file.mimeType,
        size: file.sizeOriginal,
        createdAt: file.$createdAt,
      }))
      setFiles(mediaFiles)
      setTotalFiles(response.total)
    } catch (err) {
      console.error('Failed to load files:', err)
      setError('Failed to load files. Please check your Appwrite configuration.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles?.length) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 150)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const fileId = await uploadFile(file)
        return {
          id: fileId,
          name: file.name,
          url: getFileUrl(fileId),
          type: file.type,
          size: file.size,
          createdAt: new Date().toISOString(),
        }
      })

      const newFiles = await Promise.all(uploadPromises)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reload to get fresh list
      await loadFiles()

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      console.error('Upload failed:', err)
      setError('Upload failed. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
    }

    // Reset the input
    e.target.value = ''
  }

  const handleDelete = async (fileId: string) => {
    setIsDeleting(true)
    try {
      await deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
      setDeleteConfirm(null)
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to delete file. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return

    setIsDeleting(true)
    try {
      await Promise.all(Array.from(selectedFiles).map(id => deleteFile(id)))
      await loadFiles()
      setSelectedFiles(new Set())
    } catch (err) {
      console.error('Bulk delete failed:', err)
      setError('Failed to delete some files. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const totalPages = Math.ceil(totalFiles / filesPerPage)

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Media Library</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Media Library
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage images and files for your website
          </p>
        </div>
        {selectedFiles.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected ({selectedFiles.size})
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl mb-6 bg-red-50 text-red-700 border border-red-200"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal-300 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {isUploading ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                <p className="text-gray-600 mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-1">
                  <span className="text-teal-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </>
            )}
          </label>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Storage:</strong> Appwrite Cloud (Singapore)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Bucket: {APPWRITE_BUCKET} | Project: {APPWRITE_PROJECT}
            </p>
          </div>
          <button
            onClick={loadFiles}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {isLoading && files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading files...</p>
        </div>
      ) : files.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-xl border ${
                  selectedFiles.has(file.id) ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-100'
                } overflow-hidden group`}
              >
                <div
                  className="aspect-square relative bg-gray-100 cursor-pointer"
                  onClick={() => toggleFileSelection(file.id)}
                >
                  {file.type.startsWith('image/') ? (
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Selection checkbox */}
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedFiles.has(file.id)
                      ? 'bg-teal-500 border-teal-500'
                      : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
                  }`}>
                    {selectedFiles.has(file.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url); }}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                      title="View full size"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(file.id); }}
                      className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-foundation-charcoal truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-2">No files uploaded yet</p>
          <p className="text-gray-400 text-sm">Upload files using the area above</p>
        </div>
      )}

      {/* Copy Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2 bg-foundation-charcoal text-white rounded-xl shadow-lg"
          >
            URL copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foundation-charcoal mb-2">Delete File?</h3>
                <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The file will be permanently deleted from Appwrite storage.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
