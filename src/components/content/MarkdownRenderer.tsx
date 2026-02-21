'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import EmbeddedForm from './EmbeddedForm'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[] // For select, checkbox, radio
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface ContentForm {
  id: string
  name: string
  slug: string
  title?: LocalizedString | string
  description?: LocalizedString | string
  submitButtonText?: LocalizedString | string
  successMessage?: LocalizedString | string
  fields: FormField[]
  isActive: boolean
}

// Helper to get string from LocalizedString (default to English)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

interface MarkdownRendererProps {
  content: string
  forms?: ContentForm[]
  sourceContentType?: 'projects' | 'blog_posts'
  sourceContentId?: string
  sourceContentTitle?: string
  className?: string
}

// Parse content and split by form placeholders
function parseContentWithForms(content: string): { type: 'markdown' | 'form'; content: string }[] {
  const formPattern = /\{\{form:([a-zA-Z0-9-_]+)\}\}/g
  const parts: { type: 'markdown' | 'form'; content: string }[] = []

  let lastIndex = 0
  let match

  while ((match = formPattern.exec(content)) !== null) {
    // Add markdown content before the form placeholder
    if (match.index > lastIndex) {
      const markdownContent = content.slice(lastIndex, match.index).trim()
      if (markdownContent) {
        parts.push({ type: 'markdown', content: markdownContent })
      }
    }

    // Add form placeholder
    parts.push({ type: 'form', content: match[1] }) // match[1] is the form slug

    lastIndex = match.index + match[0].length
  }

  // Add remaining markdown content
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim()
    if (remainingContent) {
      parts.push({ type: 'markdown', content: remainingContent })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'markdown', content }]
}

export default function MarkdownRenderer({
  content,
  forms = [],
  sourceContentType,
  sourceContentId,
  sourceContentTitle,
  className = '',
}: MarkdownRendererProps) {
  const parts = useMemo(() => parseContentWithForms(content), [content])

  // Create a map for quick form lookup
  const formsMap = useMemo(() => {
    const map: Record<string, ContentForm> = {}
    forms.forEach(form => {
      map[form.slug] = form
    })
    return map
  }, [forms])

  return (
    <div className={`markdown-content ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'form') {
          const form = formsMap[part.content]
          if (form && form.isActive) {
            return (
              <div key={`form-${index}`} className="my-8">
                <EmbeddedForm
                  form={form}
                  sourceContentType={sourceContentType}
                  sourceContentId={sourceContentId}
                  sourceContentTitle={sourceContentTitle}
                />
              </div>
            )
          }
          // Form not found or inactive - show placeholder in development
          return (
            <div key={`form-${index}`} className="my-8 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center text-gray-500">
              <p className="text-sm">Form &quot;{part.content}&quot; not found or inactive</p>
            </div>
          )
        }

        return (
          <ReactMarkdown
            key={`markdown-${index}`}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              // Custom styling for markdown elements
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-foundation-charcoal mt-8 mb-4 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-foundation-charcoal mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-foundation-charcoal mt-5 mb-2">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-semibold text-foundation-charcoal mt-4 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-gray-600 leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600 ml-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600 ml-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50/50 italic text-gray-700">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 bg-gray-100 text-teal-700 rounded text-sm font-mono">
                      {children}
                    </code>
                  )
                }
                return (
                  <code className="block p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-sm font-mono my-4">
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="bg-gray-900 rounded-xl overflow-x-auto my-4">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-50">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left text-sm font-semibold text-foundation-charcoal border-b">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                  {children}
                </td>
              ),
              hr: () => <hr className="my-8 border-gray-200" />,
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-xl my-4 max-w-full h-auto shadow-sm"
                />
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foundation-charcoal">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic">{children}</em>
              ),
            }}
          >
            {part.content}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}
