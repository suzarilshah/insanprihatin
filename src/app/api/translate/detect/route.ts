import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage } from '@/lib/google-translate'
import { requireAuth } from '@/lib/auth/server'
import { RateLimiters } from '@/lib/api-rate-limit'

/**
 * POST /api/translate/detect
 * Detects the language of the provided text
 *
 * SECURITY: Requires admin authentication to prevent API abuse
 *
 * Request body:
 * {
 *   text: string - The text to detect language for
 * }
 *
 * Response:
 * {
 *   language: string - Detected language code (e.g., 'en', 'ms')
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
    const { text } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (text.trim().length < 5) {
      return NextResponse.json(
        { error: 'Text must be at least 5 characters for accurate detection' },
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

    // Detect language
    const language = await detectLanguage(text)

    return NextResponse.json({
      success: true,
      language,
      // Map common language codes
      languageName: language === 'en' ? 'English'
        : language === 'ms' ? 'Bahasa Melayu'
        : language === 'id' ? 'Indonesian' // Often confused with Malay
        : language,
    })
  } catch (error) {
    console.error('Language detection API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Language detection failed'

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}
