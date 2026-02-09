import { NextRequest, NextResponse } from 'next/server'
import { translateText, type TranslateLanguage } from '@/lib/google-translate'
import { requireAuth } from '@/lib/auth/server'
import { RateLimiters } from '@/lib/api-rate-limit'

/**
 * POST /api/translate
 * Translates text from one language to another using Google Cloud Translation API
 *
 * SECURITY: Requires admin authentication to prevent API abuse
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
  // SECURITY: Require admin authentication to prevent API abuse
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // SECURITY: Rate limit to prevent abuse
  const rateLimitResponse = RateLimiters.testEndpoint(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
    if (!process.env.AZURE_TRANSLATOR_KEY) {
      return NextResponse.json(
        {
          error: 'Translation service not configured',
          details: 'AZURE_TRANSLATOR_KEY environment variable is not set',
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
 *
 * SECURITY: Requires admin authentication
 */
export async function GET() {
  // SECURITY: Require admin authentication
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isConfigured = Boolean(process.env.AZURE_TRANSLATOR_KEY)

  return NextResponse.json({
    configured: isConfigured,
    provider: 'Azure AI Translator',
    message: isConfigured
      ? 'Translation service is available (Azure AI Translator)'
      : 'Translation service not configured. Add AZURE_TRANSLATOR_KEY to your environment.',
  })
}
