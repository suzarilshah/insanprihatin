/**
 * Azure AI Translator Service
 *
 * This service provides auto-translation functionality for the admin panel.
 * It uses Azure Cognitive Services Translator API.
 *
 * Setup:
 * 1. Create an Azure Translator resource in Azure Portal
 * 2. Get the API key and region
 * 3. Add AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION to your .env.local file
 *
 * Pricing:
 * - Free tier: 2 million characters FREE per month
 * - S1: $10 per million characters
 */

const AZURE_TRANSLATOR_ENDPOINT =
  process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com/'

export type TranslateLanguage = 'en' | 'ms'

// Azure language codes mapping
const LANGUAGE_CODES: Record<TranslateLanguage, string> = {
  en: 'en',
  ms: 'ms', // Malay
}

interface AzureTranslation {
  text: string
  to: string
}

interface AzureTranslateResponse {
  translations: AzureTranslation[]
  detectedLanguage?: {
    language: string
    score: number
  }
}

interface AzureErrorResponse {
  error: {
    code: string
    message: string
  }
}

/**
 * Translates text using Azure Translator API
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
  const apiKey = process.env.AZURE_TRANSLATOR_KEY
  const region = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

  if (!apiKey) {
    throw new Error(
      'Azure Translator API key not configured. Add AZURE_TRANSLATOR_KEY to your .env.local file.'
    )
  }

  if (!text || text.trim().length === 0) {
    return ''
  }

  try {
    const url = new URL('/translate', AZURE_TRANSLATOR_ENDPOINT)
    url.searchParams.append('api-version', '3.0')
    url.searchParams.append('to', LANGUAGE_CODES[targetLang])

    if (sourceLang) {
      url.searchParams.append('from', LANGUAGE_CODES[sourceLang])
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as AzureErrorResponse
      throw new Error(
        errorData.error?.message || `Translation failed with status ${response.status}`
      )
    }

    const data = (await response.json()) as AzureTranslateResponse[]
    return data[0].translations[0].text
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
  const apiKey = process.env.AZURE_TRANSLATOR_KEY
  const region = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

  if (!apiKey) {
    throw new Error('Azure Translator API key not configured')
  }

  // Filter out empty strings and track their positions
  const validTexts = texts.filter((t) => t && t.trim().length > 0)
  if (validTexts.length === 0) {
    return texts.map(() => '')
  }

  try {
    const url = new URL('/translate', AZURE_TRANSLATOR_ENDPOINT)
    url.searchParams.append('api-version', '3.0')
    url.searchParams.append('to', LANGUAGE_CODES[targetLang])

    if (sourceLang) {
      url.searchParams.append('from', LANGUAGE_CODES[sourceLang])
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTexts.map((text) => ({ text }))),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as AzureErrorResponse
      throw new Error(errorData.error?.message || 'Batch translation failed')
    }

    const data = (await response.json()) as AzureTranslateResponse[]
    return data.map((item) => item.translations[0].text)
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
  const apiKey = process.env.AZURE_TRANSLATOR_KEY
  const region = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

  if (!apiKey) {
    throw new Error('Azure Translator API key not configured')
  }

  const detectUrl = `${AZURE_TRANSLATOR_ENDPOINT}detect?api-version=3.0`

  try {
    const response = await fetch(detectUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    })

    if (!response.ok) {
      throw new Error('Language detection failed')
    }

    const data = await response.json()
    return data[0].language
  } catch (error) {
    console.error('Language detection error:', error)
    throw error
  }
}

/**
 * Check if the Azure Translator API is configured and working
 */
export async function isTranslateConfigured(): Promise<boolean> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY
  return Boolean(apiKey && apiKey.length > 0)
}
