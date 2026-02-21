import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/navigation'
import { enforceTrustedOrigin } from '@/lib/security/request'

// Security headers for all responses
const isDev = process.env.NODE_ENV !== 'production'
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://bam.nr-data.net https://js-agent.newrelic.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://sgp.cloud.appwrite.io https://*.appwrite.global",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://bam.nr-data.net https://*.nr-data.net https://sgp.cloud.appwrite.io https://*.appwrite.global https://toyyibpay.com https://dev.toyyibpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests', 'block-all-mixed-content']),
].join('; ')

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': contentSecurityPolicy,
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
}

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing)

// Helper to add security headers to response
function addSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Wrap the auth middleware with NextAuth
export default auth((req) => {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') || ''

  // Centralized CSRF/origin enforcement for mutating API routes
  const isMutationMethod = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE'
  if (pathname.startsWith('/api') && isMutationMethod) {
    const shouldSkipOriginCheck =
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/donations/webhook')

    if (!shouldSkipOriginCheck) {
      const originCheck = enforceTrustedOrigin(req as NextRequest)
      if (originCheck) {
        return addSecurityHeaders(originCheck)
      }
    }
  }

  // Redirect non-www to www (fixes CORS preflight issues)
  // Production only - skip localhost and preview deployments
  if (host === 'insanprihatin.org') {
    const url = req.nextUrl.clone()
    url.host = 'www.insanprihatin.org'
    url.protocol = 'https'
    return NextResponse.redirect(url, 301)
  }

  // Get client IP for logging
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

  // Check if admin route (strict SSO - no dev bypass)
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/api')) {
    // No session - redirect to login
    if (!req.auth) {
      console.log(`[AUTH:MIDDLEWARE] No session - redirecting to login`, JSON.stringify({
        pathname,
        clientIP,
        timestamp: new Date().toISOString(),
      }))
      const loginUrl = new URL('/admin', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }

    // Double-check email allowlist in middleware (defense in depth)
    const userEmail = req.auth.user?.email?.toLowerCase()
    const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)

    if (!userEmail || !allowedEmails.includes(userEmail)) {
      console.warn(`[AUTH:MIDDLEWARE] UNAUTHORIZED - User email not in allowed list`, JSON.stringify({
        email: req.auth.user?.email,
        pathname,
        clientIP,
        timestamp: new Date().toISOString(),
      }))
      return addSecurityHeaders(NextResponse.redirect(new URL('/admin?error=unauthorized', req.url)))
    }

    // Authorized - continue with security headers
    console.log(`[AUTH:MIDDLEWARE] Access granted`, JSON.stringify({
      email: req.auth.user?.email,
      pathname,
      timestamp: new Date().toISOString(),
    }))
    return addSecurityHeaders(NextResponse.next())
  }

  // Admin login page - redirect to dashboard if already authenticated with valid email
  if (pathname === '/admin') {
    if (req.auth) {
      const userEmail = req.auth.user?.email?.toLowerCase()
      const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)

      if (userEmail && allowedEmails.includes(userEmail)) {
        const redirect = req.nextUrl.searchParams.get('redirect')
        console.log(`[AUTH:MIDDLEWARE] Already authenticated, redirecting to dashboard`, JSON.stringify({
          email: req.auth.user?.email,
          redirect: redirect || '/admin/dashboard',
        }))
        return addSecurityHeaders(
          NextResponse.redirect(new URL(redirect || '/admin/dashboard', req.url))
        )
      }
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // API auth routes - skip i18n, add headers, no cache
  if (pathname.startsWith('/api/auth')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return addSecurityHeaders(response)
  }

  // Other API routes - skip i18n, add headers
  if (pathname.startsWith('/api')) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Check if the path should skip i18n
  const shouldSkipI18n =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  // Skip i18n for static files and assets
  if (shouldSkipI18n) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Apply i18n middleware for public routes
  const response = intlMiddleware(req as unknown as NextRequest)
  return addSecurityHeaders(response)
})

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Match admin routes specifically
    '/admin/:path*',
    // Match API routes
    '/api/:path*',
  ],
}
