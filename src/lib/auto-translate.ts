/**
 * Auto-Translation Service
 *
 * Automatically translates localized content when only one language is provided.
 * Used by server actions when saving blog posts, projects, and other content.
 */

import { translateText, translateBatch, type TranslateLanguage } from './google-translate'
import { type LocalizedString } from '@/i18n/config'

/**
 * Auto-translate a single LocalizedString field
 * If only one language is filled, automatically translates to the other
 *
 * @param value - The localized string with potentially missing translation
 * @returns LocalizedString with both languages filled
 */
export async function autoTranslateField(
  value: LocalizedString | string | null | undefined
): Promise<LocalizedString | undefined> {
  if (!value) return undefined

  // If it's a plain string, translate to both languages
  if (typeof value === 'string') {
    if (!value.trim()) return { en: '', ms: '' }

    try {
      // Detect if it's English or Malay and translate accordingly
      const translated = await translateText(value, 'ms', 'en')
      return { en: value, ms: translated }
    } catch (error) {
      console.error('Auto-translate error for string:', error)
      return { en: value, ms: value }
    }
  }

  const hasEn = value.en && value.en.trim().length > 0
  const hasMs = value.ms && value.ms.trim().length > 0

  // Both filled - no translation needed
  if (hasEn && hasMs) {
    return value
  }

  // Neither filled - return as-is
  if (!hasEn && !hasMs) {
    return value
  }

  try {
    if (hasEn && !hasMs) {
      // Translate English to Malay
      const translated = await translateText(value.en, 'ms', 'en')
      return { en: value.en, ms: translated }
    }

    if (hasMs && !hasEn) {
      // Translate Malay to English
      const translated = await translateText(value.ms, 'en', 'ms')
      return { en: translated, ms: value.ms }
    }
  } catch (error) {
    console.error('Auto-translate error:', error)
    // On error, copy the existing value to both
    return {
      en: value.en || value.ms || '',
      ms: value.ms || value.en || '',
    }
  }

  return value
}

/**
 * Auto-translate multiple fields at once (batch operation)
 * More efficient for translating multiple fields
 *
 * @param fields - Object with field names and their localized values
 * @returns Object with all fields translated
 */
export async function autoTranslateFields<T extends Record<string, LocalizedString | string | null | undefined>>(
  fields: T
): Promise<{ [K in keyof T]: LocalizedString | undefined }> {
  const result: Record<string, LocalizedString | undefined> = {}
  const toTranslateToMs: { key: string; text: string }[] = []
  const toTranslateToEn: { key: string; text: string }[] = []

  // First pass: identify what needs translation
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      result[key] = undefined
      continue
    }

    if (typeof value === 'string') {
      if (value.trim()) {
        toTranslateToMs.push({ key, text: value })
        result[key] = { en: value, ms: '' } // Placeholder
      } else {
        result[key] = { en: '', ms: '' }
      }
      continue
    }

    const hasEn = value.en && value.en.trim().length > 0
    const hasMs = value.ms && value.ms.trim().length > 0

    if (hasEn && hasMs) {
      result[key] = value
    } else if (hasEn && !hasMs) {
      toTranslateToMs.push({ key, text: value.en })
      result[key] = { en: value.en, ms: '' }
    } else if (hasMs && !hasEn) {
      toTranslateToEn.push({ key, text: value.ms })
      result[key] = { en: '', ms: value.ms }
    } else {
      result[key] = value
    }
  }

  // Batch translate English to Malay
  if (toTranslateToMs.length > 0) {
    try {
      const translations = await translateBatch(
        toTranslateToMs.map((t) => t.text),
        'ms',
        'en'
      )
      toTranslateToMs.forEach((item, index) => {
        const existing = result[item.key]
        if (existing) {
          result[item.key] = { ...existing, ms: translations[index] }
        }
      })
    } catch (error) {
      console.error('Batch translate to MS error:', error)
      // Fallback: copy English to Malay
      toTranslateToMs.forEach((item) => {
        const existing = result[item.key]
        if (existing) {
          result[item.key] = { ...existing, ms: existing.en }
        }
      })
    }
  }

  // Batch translate Malay to English
  if (toTranslateToEn.length > 0) {
    try {
      const translations = await translateBatch(
        toTranslateToEn.map((t) => t.text),
        'en',
        'ms'
      )
      toTranslateToEn.forEach((item, index) => {
        const existing = result[item.key]
        if (existing) {
          result[item.key] = { ...existing, en: translations[index] }
        }
      })
    } catch (error) {
      console.error('Batch translate to EN error:', error)
      // Fallback: copy Malay to English
      toTranslateToEn.forEach((item) => {
        const existing = result[item.key]
        if (existing) {
          result[item.key] = { ...existing, en: existing.ms }
        }
      })
    }
  }

  return result as { [K in keyof T]: LocalizedString | undefined }
}

/**
 * Check if auto-translation is available
 */
export async function isAutoTranslateAvailable(): Promise<boolean> {
  return Boolean(process.env.AZURE_TRANSLATOR_KEY)
}
