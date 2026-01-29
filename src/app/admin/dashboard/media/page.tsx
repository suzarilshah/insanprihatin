'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT = 'insanprihatin'
const APPWRITE_BUCKET = 'yip-bucket'

export default function MediaLibrary() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [files, setFiles] = useState<{ id: string; name: string; url: string; type: string }[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles?.length) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 100)

    // For demo - in production, use Appwrite SDK
    const newFiles = Array.from(selectedFiles).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }))

    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setFiles(prev => [...newFiles, ...prev])
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }, 1000)
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      </div>

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
                  PNG, JPG, GIF up to 10MB
                </p>
              </>
            )}
          </label>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong>Storage:</strong> Appwrite Cloud (Singapore)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Bucket: {APPWRITE_BUCKET} | Project: {APPWRITE_PROJECT}
          </p>
        </div>
      </div>

      {/* Files Grid */}
      {files.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border ${
                selectedFile === file.id ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-100'
              } overflow-hidden group cursor-pointer`}
              onClick={() => setSelectedFile(file.id === selectedFile ? null : file.id)}
            >
              <div className="aspect-square relative bg-gray-100">
                {file.type.startsWith('image/') ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
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
                    title="View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-foundation-charcoal truncate">{file.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
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
    </div>
  )
}
