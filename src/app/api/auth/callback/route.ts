import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import {
  verifyOAuthState,
  resetRateLimit,
  AUTH_COOKIE_OPTIONS,
} from '@/lib/auth'

// Cache JWKS for performance
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS() {
  if (!jwksCache && process.env.NEON_AUTH_JWKS_URL) {
    jwksCache = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL))
  }
  return jwksCache
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle auth errors from provider
    if (error) {
      console.error('Auth error from provider:', error, errorDescription)
      return NextResponse.redirect(
        new URL('/admin?error=auth_failed', siteUrl)
      )
    }

    if (!code) {
      console.error('No authorization code received')
      return NextResponse.redirect(
        new URL('/admin?error=no_code', siteUrl)
      )
    }

    // Verify CSRF state parameter
    const cookieStore = await cookies()
    const csrfToken = cookieStore.get('csrf_token')?.value

    if (!state || !csrfToken) {
      console.error('Missing state or CSRF token')
      return NextResponse.redirect(
        new URL('/admin?error=invalid_state', siteUrl)
      )
    }

    const stateVerification = verifyOAuthState(state, csrfToken)
    if (!stateVerification.valid) {
      console.error('State verification failed')
      return NextResponse.redirect(
        new URL('/admin?error=invalid_state', siteUrl)
      )
    }

    // Clear CSRF token cookie after verification
    cookieStore.delete('csrf_token')

    // Exchange code for tokens
    const tokenUrl = `${process.env.NEON_AUTH_URL}/token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${siteUrl}/api/auth/callback`,
        client_id: 'neon-auth',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorText)
      return NextResponse.redirect(
        new URL('/admin?error=token_exchange_failed', siteUrl)
      )
    }

    const tokens = await tokenResponse.json()
    const { id_token, access_token } = tokens

    if (!id_token || !access_token) {
      console.error('Missing tokens in response')
      return NextResponse.redirect(
        new URL('/admin?error=token_exchange_failed', siteUrl)
      )
    }

    // Verify the ID token using JWKS
    const JWKS = getJWKS()
    if (!JWKS) {
      console.error('JWKS not configured')
      return NextResponse.redirect(
        new URL('/admin?error=config_error', siteUrl)
      )
    }

    const { payload } = await jwtVerify(id_token, JWKS, {
      issuer: process.env.NEON_AUTH_URL,
    })

    const email = payload.email as string
    if (!email) {
      console.error('No email in token payload')
      return NextResponse.redirect(
        new URL('/admin?error=no_email', siteUrl)
      )
    }

    // Verify email matches what was requested (defense in depth)
    if (email.toLowerCase() !== stateVerification.email.toLowerCase()) {
      console.error('Email mismatch:', email, 'vs', stateVerification.email)
      return NextResponse.redirect(
        new URL('/admin?error=email_mismatch', siteUrl)
      )
    }

    // Verify user is an authorized admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser) {
      console.error('User not found in admin_users table')
      return NextResponse.redirect(
        new URL('/admin?error=unauthorized', siteUrl)
      )
    }

    if (!adminUser.isActive) {
      console.error('User account is deactivated')
      return NextResponse.redirect(
        new URL('/admin?error=account_disabled', siteUrl)
      )
    }

    // Update last login timestamp
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id))

    // Reset rate limit on successful login
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    resetRateLimit(clientIP)

    // Set secure auth cookie with access token
    cookieStore.set('auth_token', access_token, AUTH_COOKIE_OPTIONS)

    // Store minimal user info for UI (not security critical)
    // This is readable by JS but NOT used for authentication
    cookieStore.set('user_info', JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    }), {
      httpOnly: false, // Allow JS access for UI only
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Redirect to dashboard
    return NextResponse.redirect(
      new URL('/admin/dashboard', siteUrl)
    )
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/admin?error=callback_failed', siteUrl)
    )
  }
}
