import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/navigation'

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path should skip i18n (admin, api routes)
  const shouldSkipI18n =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')

  // For admin routes, apply auth logic
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/api')) {
    const authToken = request.cookies.get('admin_session')?.value

    // No token - redirect to login
    if (!authToken) {
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const redirectResponse = NextResponse.redirect(loginUrl)

      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }

    // Basic token validation
    if (authToken.length < 10) {
      const loginUrl = new URL('/admin?error=invalid_session', request.url)
      const redirectResponse = NextResponse.redirect(loginUrl)

      redirectResponse.cookies.delete('admin_session')
      redirectResponse.cookies.delete('user_info')

      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }

    // Dev token check
    if (authToken === 'dev-token') {
      const isDev = process.env.NODE_ENV === 'development'
      if (!isDev) {
        const loginUrl = new URL('/admin?error=invalid_session', request.url)
        const redirectResponse = NextResponse.redirect(loginUrl)

        redirectResponse.cookies.delete('admin_session')
        redirectResponse.cookies.delete('user_info')

        Object.entries(securityHeaders).forEach(([key, value]) => {
          redirectResponse.headers.set(key, value)
        })

        return redirectResponse
      }
    }

    // Token exists and passes validation - continue with security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Admin login page - redirect to dashboard if already authenticated
  if (pathname === '/admin') {
    const authToken = request.cookies.get('admin_session')?.value
    const redirect = request.nextUrl.searchParams.get('redirect')

    if (authToken && authToken.length > 10) {
      const redirectUrl = new URL(redirect || '/admin/dashboard', request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)

      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }

    // Not authenticated - show login page with security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // API routes - skip i18n, add headers
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next()
    if (pathname.startsWith('/api/auth')) {
      response.headers.set('Cache-Control', 'no-store, max-age=0')
    }
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Skip i18n for static files and assets
  if (shouldSkipI18n) {
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Apply i18n middleware for all other routes
  const response = intlMiddleware(request)

  // Add security headers to i18n response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  // Match all paths except static files
  matcher: [
    // Match all pathnames except for
    // - ... if they start with /api, /_next, /images, or /favicon
    // - ... if they contain a dot (static files)
    '/((?!api|_next|images|favicon|.*\\..*).*)',
    // Match admin routes specifically
    '/admin/:path*',
    '/api/:path*',
  ],
}
