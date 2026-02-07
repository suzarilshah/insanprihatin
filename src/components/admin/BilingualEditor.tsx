'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type LocalizedString } from '@/i18n/config'

type EditorMode = 'tabs' | 'side-by-side'
type FieldType = 'input' | 'textarea' | 'richtext'

interface BilingualEditorProps {
  value: LocalizedString | string | null | undefined
  onChange: (value: LocalizedString) => void
  label?: string
  placeholder?: { en?: string; ms?: string }
  required?: boolean
  fieldType?: FieldType
  rows?: number
  maxLength?: number
  className?: string
  mode?: EditorMode
  showCharCount?: boolean
  onTranslate?: (text: string, targetLang: 'en' | 'ms', sourceLang: 'en' | 'ms') => Promise<string>
}

const localeNames = {
  en: 'English',
  ms: 'Bahasa Melayu',
}

const localeFlags = {
  en: '🇬🇧',
  ms: '🇲🇾',
}

/**
 * BilingualEditor - A reusable component for editing bilingual content
 *
 * Features:
 * - Tab-based or side-by-side language editing
 * - Auto-translate button to fill missing language
 * - Visual indicators for filled/empty fields
 * - Character count display
 * - Detected language indicator
 */
export default function BilingualEditor({
  value,
  onChange,
  label,
  placeholder = {},
  required = false,
  fieldType = 'input',
  rows = 3,
  maxLength,
  className = '',
  mode = 'tabs',
  showCharCount = false,
  onTranslate,
}: BilingualEditorProps) {
  // Normalize value to LocalizedString
  const normalizedValue: LocalizedString = typeof value === 'string'
    ? { en: value, ms: value }
    : value || { en: '', ms: '' }

  const [activeTab, setActiveTab] = useState<'en' | 'ms'>('en')
  const [isTranslating, setIsTranslating] = useState<'en' | 'ms' | null>(null)
  const [detectedLang, setDetectedLang] = useState<'en' | 'ms' | null>(null)
  const [lastDetectionText, setLastDetectionText] = useState('')

  // Check which languages have content
  const hasEn = normalizedValue.en?.trim().length > 0
  const hasMs = normalizedValue.ms?.trim().length > 0

  // Handle text change for a specific language
  const handleChange = useCallback((lang: 'en' | 'ms', text: string) => {
    onChange({
      ...normalizedValue,
      [lang]: text,
    })
  }, [normalizedValue, onChange])

  // Auto-translate missing language
  const handleAutoTranslate = async (targetLang: 'en' | 'ms') => {
    const sourceLang = targetLang === 'en' ? 'ms' : 'en'
    const sourceText = normalizedValue[sourceLang]

    if (!sourceText?.trim()) return

    setIsTranslating(targetLang)

    try {
      let translatedText: string

      if (onTranslate) {
        // Use custom translate function if provided
        translatedText = await onTranslate(sourceText, targetLang, sourceLang)
      } else {
        // Use the API endpoint
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            targetLang,
            sourceLang,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Translation failed')
        }

        const data = await response.json()
        translatedText = data.translatedText
      }

      onChange({
        ...normalizedValue,
        [targetLang]: translatedText,
      })
    } catch (error) {
      console.error('Translation error:', error)
      // Could show a toast notification here
    } finally {
      setIsTranslating(null)
    }
  }

  // Detect language of current input (debounced)
  useEffect(() => {
    const currentText = normalizedValue[activeTab]
    if (!currentText || currentText.length < 20 || currentText === lastDetectionText) {
      return
    }

    const detectLanguage = async () => {
      try {
        const response = await fetch('/api/translate/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentText }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.language === 'en' || data.language === 'ms') {
            setDetectedLang(data.language)
            setLastDetectionText(currentText)
          }
        }
      } catch {
        // Silently fail - detection is optional
      }
    }

    const timer = setTimeout(detectLanguage, 1000)
    return () => clearTimeout(timer)
  }, [normalizedValue, activeTab, lastDetectionText])

  // Render input field based on type
  const renderField = (lang: 'en' | 'ms') => {
    const commonProps = {
      value: normalizedValue[lang] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(lang, e.target.value),
      placeholder: placeholder[lang] || `Enter ${localeNames[lang]} text...`,
      maxLength,
      className: `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
        transition-colors ${fieldType === 'textarea' ? 'resize-none font-mono text-sm' : ''}`,
    }

    if (fieldType === 'textarea') {
      return <textarea {...commonProps} rows={rows} />
    }

    return <input type="text" {...commonProps} />
  }

  // Render status indicator for a language
  const renderStatusBadge = (lang: 'en' | 'ms') => {
    const hasContent = lang === 'en' ? hasEn : hasMs
    const isDetected = detectedLang === lang && activeTab === lang

    return (
      <div className="flex items-center gap-2">
        {hasContent ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Filled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Empty
          </span>
        )}
        {isDetected && (
          <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Detected
          </span>
        )}
      </div>
    )
  }

  // Tabs Mode
  if (mode === 'tabs') {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Tab Headers */}
        <div className="flex items-center gap-1 mb-3 p-1 bg-gray-100 rounded-xl">
          {(['en', 'ms'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === lang
                  ? 'bg-white text-foundation-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span>{localeFlags[lang]}</span>
              <span>{localeNames[lang]}</span>
              <span className={`w-2 h-2 rounded-full ${
                (lang === 'en' ? hasEn : hasMs)
                  ? 'bg-emerald-500'
                  : 'bg-amber-400'
              }`} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-2">
              {renderField(activeTab)}

              {/* Bottom bar with status and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {renderStatusBadge(activeTab)}

                  {showCharCount && (
                    <span className="text-xs text-gray-400">
                      {normalizedValue[activeTab]?.length || 0}
                      {maxLength && ` / ${maxLength}`} chars
                    </span>
                  )}
                </div>

                {/* Auto-translate button */}
                {((activeTab === 'en' && hasMs && !hasEn) || (activeTab === 'ms' && hasEn && !hasMs)) && (
                  <button
                    type="button"
                    onClick={() => handleAutoTranslate(activeTab)}
                    disabled={isTranslating !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTranslating === activeTab ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Translating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Auto-translate from {activeTab === 'en' ? 'Malay' : 'English'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Side-by-Side Mode
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {(['en', 'ms'] as const).map((lang) => (
          <div key={lang} className="space-y-2">
            {/* Language header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span>{localeFlags[lang]}</span>
                <span>{localeNames[lang]}</span>
              </div>
              {renderStatusBadge(lang)}
            </div>

            {/* Input field */}
            {renderField(lang)}

            {/* Bottom bar */}
            <div className="flex items-center justify-between">
              {showCharCount && (
                <span className="text-xs text-gray-400">
                  {normalizedValue[lang]?.length || 0}
                  {maxLength && ` / ${maxLength}`} chars
                </span>
              )}

              {/* Auto-translate button */}
              {((lang === 'en' && hasMs && !hasEn) || (lang === 'ms' && hasEn && !hasMs)) && (
                <button
                  type="button"
                  onClick={() => handleAutoTranslate(lang)}
                  disabled={isTranslating !== null}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium
                    text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranslating === lang ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  )}
                  Translate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
