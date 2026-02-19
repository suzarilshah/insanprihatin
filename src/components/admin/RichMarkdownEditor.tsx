'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface RichMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  showToolbar?: boolean
  showPreview?: boolean
  autoFocus?: boolean
}

const toolbarGroups = [
  {
    name: 'headings',
    items: [
      { icon: 'H1', action: 'h1', label: 'Heading 1', shortcut: 'Ctrl+1' },
      { icon: 'H2', action: 'h2', label: 'Heading 2', shortcut: 'Ctrl+2' },
      { icon: 'H3', action: 'h3', label: 'Heading 3', shortcut: 'Ctrl+3' },
    ]
  },
  {
    name: 'formatting',
    items: [
      { icon: 'B', action: 'bold', label: 'Bold', shortcut: 'Ctrl+B', className: 'font-bold' },
      { icon: 'I', action: 'italic', label: 'Italic', shortcut: 'Ctrl+I', className: 'italic' },
      { icon: 'S', action: 'strikethrough', label: 'Strikethrough', shortcut: 'Ctrl+Shift+S', className: 'line-through' },
      { icon: '</>', action: 'code', label: 'Inline Code', shortcut: 'Ctrl+`', className: 'font-mono text-xs' },
    ]
  },
  {
    name: 'lists',
    items: [
      { icon: '•', action: 'ul', label: 'Bullet List', shortcut: 'Ctrl+Shift+8' },
      { icon: '1.', action: 'ol', label: 'Numbered List', shortcut: 'Ctrl+Shift+7' },
      { icon: '☐', action: 'task', label: 'Task List', shortcut: 'Ctrl+Shift+9' },
    ]
  },
  {
    name: 'blocks',
    items: [
      { icon: '"', action: 'quote', label: 'Blockquote', shortcut: 'Ctrl+Shift+.' },
      { icon: '—', action: 'hr', label: 'Horizontal Rule', shortcut: 'Ctrl+Shift+-' },
      { icon: '{ }', action: 'codeblock', label: 'Code Block', shortcut: 'Ctrl+Shift+K', className: 'font-mono text-xs' },
    ]
  },
  {
    name: 'insert',
    items: [
      { icon: '🔗', action: 'link', label: 'Insert Link', shortcut: 'Ctrl+K' },
      { icon: '🖼', action: 'image', label: 'Insert Image', shortcut: 'Ctrl+Shift+I' },
      { icon: '📋', action: 'table', label: 'Insert Table', shortcut: 'Ctrl+Shift+T' },
    ]
  },
]

export default function RichMarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '400px',
  showToolbar = true,
  showPreview = true,
  autoFocus = false,
}: RichMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write')
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  // Calculate stats
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0
    const chars = value.length
    const time = Math.ceil(words / 200) // Average reading speed
    setWordCount(words)
    setCharCount(chars)
    setReadingTime(time)
  }, [value])

  // Get selection range
  const getSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: value.substring(textarea.selectionStart, textarea.selectionEnd),
    }
  }, [value])

  // Insert text at cursor
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end, text } = getSelection()
    const selectedText = text || placeholder
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length
      textarea.setSelectionRange(
        text ? newPosition + after.length : start + before.length,
        text ? newPosition + after.length : start + before.length + placeholder.length
      )
    }, 0)
  }, [value, onChange, getSelection])

  // Handle toolbar actions
  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'h1':
        insertText('# ', '', 'Heading 1')
        break
      case 'h2':
        insertText('## ', '', 'Heading 2')
        break
      case 'h3':
        insertText('### ', '', 'Heading 3')
        break
      case 'bold':
        insertText('**', '**', 'bold text')
        break
      case 'italic':
        insertText('*', '*', 'italic text')
        break
      case 'strikethrough':
        insertText('~~', '~~', 'strikethrough')
        break
      case 'code':
        insertText('`', '`', 'code')
        break
      case 'ul':
        insertText('- ', '', 'List item')
        break
      case 'ol':
        insertText('1. ', '', 'List item')
        break
      case 'task':
        insertText('- [ ] ', '', 'Task item')
        break
      case 'quote':
        insertText('> ', '', 'Blockquote')
        break
      case 'hr':
        insertText('\n\n---\n\n', '')
        break
      case 'codeblock':
        insertText('\n```\n', '\n```\n', 'code block')
        break
      case 'link':
        insertText('[', '](url)', 'link text')
        break
      case 'image':
        insertText('![', '](image-url)', 'alt text')
        break
      case 'table':
        insertText('\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n', '')
        break
    }
  }, [insertText])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return

      const isMod = e.metaKey || e.ctrlKey

      if (isMod && !e.shiftKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            handleAction('bold')
            break
          case 'i':
            e.preventDefault()
            handleAction('italic')
            break
          case 'k':
            e.preventDefault()
            handleAction('link')
            break
          case '1':
            e.preventDefault()
            handleAction('h1')
            break
          case '2':
            e.preventDefault()
            handleAction('h2')
            break
          case '3':
            e.preventDefault()
            handleAction('h3')
            break
        }
      }

      if (isMod && e.shiftKey) {
        switch (e.key) {
          case 'S':
            e.preventDefault()
            handleAction('strikethrough')
            break
          case 'K':
            e.preventDefault()
            handleAction('codeblock')
            break
          case '8':
            e.preventDefault()
            handleAction('ul')
            break
          case '7':
            e.preventDefault()
            handleAction('ol')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleAction])

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b border-gray-100 bg-gray-50/50">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
              {(['write', 'split', 'preview'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === mode
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'write' && '✏️ Write'}
                  {mode === 'split' && '⚡ Split'}
                  {mode === 'preview' && '👁 Preview'}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {viewMode !== 'preview' && (
            <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
              {toolbarGroups.map((group, groupIndex) => (
                <div key={group.name} className="flex items-center">
                  {groupIndex > 0 && <div className="w-px h-6 bg-gray-200 mx-2" />}
                  <div className="flex items-center gap-0.5">
                    {group.items.map((item) => (
                      <div key={item.action} className="relative">
                        <button
                          type="button"
                          onClick={() => handleAction(item.action)}
                          onMouseEnter={() => setActiveTooltip(item.action)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className={`p-2 rounded-lg text-gray-600 hover:bg-white hover:text-teal-600 hover:shadow-sm transition-all text-sm ${item.className || ''}`}
                        >
                          {item.icon}
                        </button>

                        {/* Tooltip */}
                        <AnimatePresence>
                          {activeTooltip === item.action && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                            >
                              {item.label}
                              <span className="ml-2 text-gray-400">{item.shortcut}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor / Preview Area */}
      <div className={`flex ${viewMode === 'split' ? 'divide-x divide-gray-200' : ''}`} style={{ minHeight }}>
        {/* Editor */}
        {viewMode !== 'preview' && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-700 placeholder:text-gray-400"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto bg-white`}>
            <div className="p-6 prose prose-sm max-w-none prose-headings:text-foundation-charcoal prose-p:text-gray-600 prose-a:text-teal-600 prose-strong:text-foundation-charcoal prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1 prose-code:rounded">
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
