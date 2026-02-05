// Locale configuration for the application
export const locales = ['en', 'ms'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ms: 'Bahasa Melayu',
}

// Locale flags/icons for UI
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  ms: '🇲🇾',
}

// Type for localized content stored in database
export type LocalizedString = {
  en: string
  ms: string
}

// Helper to check if a value is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// Helper to get localized value with fallback
export function getLocalizedValue(
  field: LocalizedString | string | null | undefined,
  locale: Locale
): string {
  if (!field) return ''

  // If it's a plain string (legacy data), return as-is
  if (typeof field === 'string') return field

  // Return the localized value or fallback to English
  return field[locale] || field.en || ''
}
