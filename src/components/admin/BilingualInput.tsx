'use client'

import { useState, useCallback } from 'react'
import { type Locale, localeNames, localeFlags } from '@/i18n/config'

export interface LocalizedValue {
  en: string
  ms: string
}

interface BilingualInputProps {
  label: string
  value: LocalizedValue
  onChange: (value: LocalizedValue) => void
  type?: 'input' | 'textarea' | 'markdown'
  rows?: number
  placeholder?: { en: string; ms: string }
  required?: boolean
  disabled?: boolean
  className?: string
  helperText?: string
}

/**
 * BilingualInput Component
 *
 * A dual-language input component that allows admins to enter content in both
 * English and Bahasa Melayu. Features tab-based switching and optional
 * auto-translation using Google Translate API.
 */
export default function BilingualInput({
  label,
  value,
  onChange,
  type = 'input',
  rows = 4,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  helperText,
}: BilingualInputProps) {
  const [activeTab, setActiveTab] = useState<Locale>('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  // Handle input change
  const handleChange = useCallback(
    (locale: Locale, newValue: string) => {
      onChange({ ...value, [locale]: newValue })
      setTranslateError(null)
    },
    [value, onChange]
  )

  // Auto-translate from current language to the other
  const handleAutoTranslate = useCallback(async () => {
    const sourceLocale = activeTab
    const targetLocale: Locale = sourceLocale === 'en' ? 'ms' : 'en'
    const sourceText = value[sourceLocale]

    if (!sourceText || sourceText.trim().length === 0) {
      setTranslateError('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    setTranslateError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLang: targetLocale,
          sourceLang: sourceLocale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      // Update the target language with translated text
      onChange({ ...value, [targetLocale]: data.translatedText })

      // Switch to the translated tab to show the result
      setActiveTab(targetLocale)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslateError(
        error instanceof Error ? error.message : 'Translation failed. Please try again.'
      )
    } finally {
      setIsTranslating(false)
    }
  }, [activeTab, value, onChange])

  // Check if both languages are filled
  const enFilled = value.en && value.en.trim().length > 0
  const msFilled = value.ms && value.ms.trim().length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and language tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Language Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['en', 'ms'] as Locale[]).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveTab(locale)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === locale
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input/Textarea */}
      <div className="relative">
        {type === 'input' ? (
          <input
            type="text"
            value={value[activeTab] || ''}
            onChange={(e) => handleChange(activeTab, e.target.value)}
            placeholder={placeholder?.[activeTab] || `Enter ${localeNames[activeTab]} text...`}
            disabled={disabled || isTranslating}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : (
          <textarea
            value={value[activeTab] || ''}
            onChange={(e) => handleChange(activeTab, e.target.value)}
            placeholder={placeholder?.[activeTab] || `Enter ${localeNames[activeTab]} text...`}
            disabled={disabled || isTranslating}
            rows={rows}
            className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'markdown' ? 'font-mono text-sm' : ''
            }`}
          />
        )}

        {/* Loading overlay */}
        {isTranslating && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <span>Translating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Translation status and controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Status indicators */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              enFilled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            EN {enFilled ? '✓' : '○'}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              msFilled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            BM {msFilled ? '✓' : '○'}
          </span>
        </div>

        {/* Auto-translate button */}
        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={disabled || isTranslating || !value[activeTab]?.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span>
            {isTranslating
              ? 'Translating...'
              : `Translate to ${activeTab === 'en' ? 'BM' : 'EN'}`}
          </span>
        </button>
      </div>

      {/* Error message */}
      {translateError && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{translateError}</p>
      )}

      {/* Helper text */}
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  )
}

/**
 * Helper function to create an empty localized value
 */
export function createEmptyLocalized(): LocalizedValue {
  return { en: '', ms: '' }
}

/**
 * Helper function to check if a localized value has content in all languages
 */
export function isLocalizedComplete(value: LocalizedValue): boolean {
  return Boolean(value.en?.trim() && value.ms?.trim())
}

/**
 * Helper function to check if a localized value has content in at least one language
 */
export function hasLocalizedContent(value: LocalizedValue): boolean {
  return Boolean(value.en?.trim() || value.ms?.trim())
}
