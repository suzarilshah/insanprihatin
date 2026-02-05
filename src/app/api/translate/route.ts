import { NextRequest, NextResponse } from 'next/server'
import { translateText, type TranslateLanguage } from '@/lib/google-translate'

/**
 * POST /api/translate
 * Translates text from one language to another using Google Cloud Translation API
 *
 * Request body:
 * {
 *   text: string - The text to translate
 *   targetLang: 'en' | 'ms' - Target language
 *   sourceLang?: 'en' | 'ms' - Optional source language (auto-detected if not provided)
 * }
 *
 * Response:
 * {
 *   translatedText: string - The translated text
 *   success: true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLang, sourceLang } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (!targetLang || !['en', 'ms'].includes(targetLang)) {
      return NextResponse.json(
        { error: 'Target language must be "en" or "ms"' },
        { status: 400 }
      )
    }

    if (sourceLang && !['en', 'ms'].includes(sourceLang)) {
      return NextResponse.json(
        { error: 'Source language must be "en" or "ms"' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      return NextResponse.json(
        {
          error: 'Translation service not configured',
          details: 'GOOGLE_TRANSLATE_API_KEY environment variable is not set',
        },
        { status: 503 }
      )
    }

    // Perform translation
    const translatedText = await translateText(
      text,
      targetLang as TranslateLanguage,
      sourceLang as TranslateLanguage | undefined
    )

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLang: sourceLang || 'auto',
      targetLang,
    })
  } catch (error) {
    console.error('Translation API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Translation failed'

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/translate
 * Check if the translation service is configured
 */
export async function GET() {
  const isConfigured = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY)

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? 'Translation service is available'
      : 'Translation service not configured. Add GOOGLE_TRANSLATE_API_KEY to your environment.',
  })
}
