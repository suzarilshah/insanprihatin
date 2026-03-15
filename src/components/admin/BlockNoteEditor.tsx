'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { AnimatePresence } from 'framer-motion'
import InlineImagePicker from './InlineImagePicker'

interface BlockNoteEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  autoFocus?: boolean
}

// Custom upload function that uses our existing upload API
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Upload failed')
  }

  const data = await response.json()
  return data.fileUrl
}

export default function BlockNoteEditor({
  onChange,
  placeholder: _placeholder = 'Start writing your content...',
  minHeight = '500px',
  autoFocus: _autoFocus = false,
  value,
}: BlockNoteEditorProps) {
  // Note: placeholder and autoFocus are handled internally by BlockNote
  void _placeholder
  void _autoFocus
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [editorStats, setEditorStats] = useState({ words: 0, chars: 0, readTime: 0 })
  const initialValueRef = useRef(value)

  // Create the BlockNote editor with custom upload handler
  const editor = useCreateBlockNote({
    uploadFile,
  })

  // Load initial content from markdown
  useEffect(() => {
    if (!editor || isInitialized) return

    const loadContent = async () => {
      const initialMarkdown = initialValueRef.current
      if (initialMarkdown.trim()) {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown)
          if (blocks.length > 0) {
            // Use type assertion to bypass strict typing
            editor.replaceBlocks(editor.document, blocks as typeof editor.document)
          }
        } catch (error) {
          console.error('Failed to load initial content:', error)
        }
      }
      setIsInitialized(true)
    }

    loadContent()
  }, [editor, isInitialized])

  // Handle editor changes - convert to markdown
  useEffect(() => {
    if (!editor || !isInitialized) return

    const handleChange = async () => {
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document)
        onChange(markdown)

        // Update stats
        const text = markdown.replace(/[#*_\[\]()]/g, '')
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const chars = text.length
        const readTime = Math.ceil(words / 200)
        setEditorStats({ words, chars, readTime })
      } catch (error) {
        console.error('Failed to convert blocks to markdown:', error)
      }
    }

    // Subscribe to content changes
    const unsubscribe = editor.onChange(handleChange)

    return () => {
      unsubscribe()
    }
  }, [editor, onChange, isInitialized])

  // Insert image at specific position
  const handleImageInsert = useCallback(async (imageUrl: string) => {
    if (!editor) return

    const imageBlock = {
      type: 'image' as const,
      props: {
        url: imageUrl,
        caption: '',
        previewWidth: 512,
      },
    }

    // Get cursor position or insert at end
    const textCursor = editor.getTextCursorPosition()
    if (textCursor?.block) {
      editor.insertBlocks([imageBlock], textCursor.block, 'after')
    } else {
      // Insert at end of document
      const lastBlock = editor.document[editor.document.length - 1]
      if (lastBlock) {
        editor.insertBlocks([imageBlock], lastBlock, 'after')
      }
    }

    setIsImagePickerOpen(false)
  }, [editor])

  // Open image picker
  const openImagePicker = useCallback(() => {
    setIsImagePickerOpen(true)
  }, [])

  // Custom side menu component to add image insertion button
  const ImageInsertButton = useMemo(() => {
    if (!editor) return null

    return (
      <button
        type="button"
        onClick={openImagePicker}
        className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm flex items-center gap-1.5 text-sm font-medium"
        title="Insert image at cursor position"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add Image
      </button>
    )
  }, [editor, openImagePicker])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ImageInsertButton}
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-[10px]">/</kbd>
                <span>Commands</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Drag blocks</span>
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{editorStats.words} words</span>
            <span>{editorStats.chars} chars</span>
            <span>{editorStats.readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        className="blocknote-editor-wrapper"
        style={{ minHeight }}
      >
        <BlockNoteView
          editor={editor}
          theme="light"
        />
      </div>

      {/* Image Picker Modal */}
      <AnimatePresence>
        {isImagePickerOpen && (
          <InlineImagePicker
            isOpen={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            onSelect={handleImageInsert}
          />
        )}
      </AnimatePresence>

      {/* Custom styles */}
      <style jsx global>{`
        .blocknote-editor-wrapper {
          padding: 1rem;
        }

        .blocknote-editor-wrapper .bn-editor {
          font-family: inherit;
          min-height: ${minHeight};
        }

        .blocknote-editor-wrapper .bn-block-content {
          font-size: 1rem;
          line-height: 1.75;
        }

        .blocknote-editor-wrapper .bn-inline-content {
          font-family: inherit;
        }

        .blocknote-editor-wrapper [data-content-type="image"] {
          margin: 1.5rem 0;
        }

        .blocknote-editor-wrapper [data-content-type="image"] img {
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .blocknote-editor-wrapper .bn-side-menu {
          opacity: 0.6;
          transition: opacity 0.15s;
        }

        .blocknote-editor-wrapper .bn-side-menu:hover {
          opacity: 1;
        }

        .blocknote-editor-wrapper .bn-drag-handle {
          cursor: grab;
        }

        .blocknote-editor-wrapper .bn-drag-handle:active {
          cursor: grabbing;
        }

        /* Heading styles */
        .blocknote-editor-wrapper [data-content-type="heading"][data-level="1"] {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-top: 2rem;
        }

        .blocknote-editor-wrapper [data-content-type="heading"][data-level="2"] {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-top: 1.5rem;
        }

        .blocknote-editor-wrapper [data-content-type="heading"][data-level="3"] {
          font-size: 1.25rem;
          font-weight: 600;
          color: #4a5568;
          margin-top: 1.25rem;
        }

        /* List styles */
        .blocknote-editor-wrapper [data-content-type="bulletListItem"],
        .blocknote-editor-wrapper [data-content-type="numberedListItem"] {
          margin-left: 1.5rem;
        }

        /* Blockquote styles */
        .blocknote-editor-wrapper [data-content-type="quote"] {
          border-left: 4px solid #14b8a6;
          padding-left: 1rem;
          color: #4a5568;
          font-style: italic;
        }

        /* Code block styles */
        .blocknote-editor-wrapper [data-content-type="codeBlock"] {
          background: #f7fafc;
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: ui-monospace, monospace;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
