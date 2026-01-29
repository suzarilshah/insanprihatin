import { NextRequest, NextResponse } from 'next/server'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import {
  checkRateLimit,
  generateCSRFToken,
  createOAuthState,
  isValidEmail,
  sanitizeEmail,
  CSRF_COOKIE_OPTIONS,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.`,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter!.toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { email: rawEmail } = body

    if (!rawEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize email
    if (!isValidEmail(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const email = sanitizeEmail(rawEmail)

    // Check if user is an authorized admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email),
    })

    if (!adminUser) {
      // Don't reveal whether email exists - generic error
      return NextResponse.json(
        { error: 'Unable to process login request. Please contact support if you believe this is an error.' },
        { status: 403 }
      )
    }

    if (!adminUser.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify Neon Auth configuration
    const neonAuthUrl = process.env.NEON_AUTH_URL
    if (!neonAuthUrl) {
      console.error('NEON_AUTH_URL not configured')
      return NextResponse.json(
        { error: 'Authentication service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Generate CSRF token for state verification
    const csrfToken = generateCSRFToken()
    const state = createOAuthState(email, csrfToken)

    // Store CSRF token in httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('csrf_token', csrfToken, CSRF_COOKIE_OPTIONS)

    // Build the authorization URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const authUrl = new URL(`${neonAuthUrl}/authorize`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', 'neon-auth')
    authUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback`)
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('login_hint', email)
    authUrl.searchParams.set('state', state)

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      message: 'Redirecting to authentication...',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
