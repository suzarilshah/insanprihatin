'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface ExportButtonProps {
  environment?: string
}

export default function ExportButton({ environment = 'production' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const searchParams = useSearchParams()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Build export URL with current filters
      const params = new URLSearchParams()

      // Get current filter values from URL
      const status = searchParams.get('status')
      const project = searchParams.get('project')
      const from = searchParams.get('from')
      const to = searchParams.get('to')
      const env = searchParams.get('environment') || environment

      if (status && status !== 'all') params.set('status', status)
      if (project && project !== 'all') params.set('project', project)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (env) params.set('environment', env)

      const exportUrl = `/api/donations/export?${params.toString()}`

      // Fetch the CSV
      const response = await fetch(exportUrl)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'donations-export.csv'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export donations. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </>
      )}
    </button>
  )
}
