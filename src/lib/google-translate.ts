/**
 * Google Cloud Translation API Service
 *
 * This service provides auto-translation functionality for the admin panel.
 * It uses Google Cloud Translation API v2 (Basic).
 *
 * Setup:
 * 1. Enable Cloud Translation API in Google Cloud Console
 * 2. Create an API key
 * 3. Add GOOGLE_TRANSLATE_API_KEY to your .env.local file
 *
 * Pricing:
 * - 500,000 characters FREE per month (never expires)
 * - $20 per million characters after free tier
 */

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'

export type TranslateLanguage = 'en' | 'ms'

interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string
      detectedSourceLanguage?: string
    }>
  }
}

interface TranslateError {
  error: {
    code: number
    message: string
    status: string
  }
}

/**
 * Translates text using Google Cloud Translation API
 *
 * @param text - The text to translate
 * @param targetLang - Target language code ('en' or 'ms')
 * @param sourceLang - Optional source language code
 * @returns Translated text
 */
export async function translateText(
  text: string,
  targetLang: TranslateLanguage,
  sourceLang?: TranslateLanguage
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    throw new Error(
      'Google Translate API key not configured. Add GOOGLE_TRANSLATE_API_KEY to your .env.local file.'
    )
  }

  if (!text || text.trim().length === 0) {
    return ''
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: text,
      target: targetLang,
      format: 'text', // Use 'text' for plain text, 'html' for HTML content
    })

    if (sourceLang) {
      params.append('source', sourceLang)
    }

    const response = await fetch(`${TRANSLATE_API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = (await response.json()) as TranslateError
      throw new Error(
        errorData.error?.message || `Translation failed with status ${response.status}`
      )
    }

    const data = (await response.json()) as TranslateResponse
    return data.data.translations[0].translatedText
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

/**
 * Translates multiple texts in a single API call (batch translation)
 *
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Optional source language code
 * @returns Array of translated texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: TranslateLanguage,
  sourceLang?: TranslateLanguage
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    throw new Error('Google Translate API key not configured')
  }

  // Filter out empty strings
  const validTexts = texts.filter((t) => t && t.trim().length > 0)
  if (validTexts.length === 0) {
    return texts.map(() => '')
  }

  try {
    const response = await fetch(`${TRANSLATE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: validTexts,
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as TranslateError
      throw new Error(errorData.error?.message || 'Batch translation failed')
    }

    const data = (await response.json()) as TranslateResponse
    return data.data.translations.map((t) => t.translatedText)
  } catch (error) {
    console.error('Batch translation error:', error)
    throw error
  }
}

/**
 * Detects the language of a text
 *
 * @param text - Text to detect language for
 * @returns Detected language code
 */
export async function detectLanguage(text: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    throw new Error('Google Translate API key not configured')
  }

  const detectUrl = 'https://translation.googleapis.com/language/translate/v2/detect'

  try {
    const response = await fetch(`${detectUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: text }),
    })

    if (!response.ok) {
      throw new Error('Language detection failed')
    }

    const data = await response.json()
    return data.data.detections[0][0].language
  } catch (error) {
    console.error('Language detection error:', error)
    throw error
  }
}

/**
 * Check if the Google Translate API is configured and working
 */
export async function isTranslateConfigured(): Promise<boolean> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  return Boolean(apiKey && apiKey.length > 0)
}
