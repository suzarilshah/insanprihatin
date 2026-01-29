import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Check if accessing protected admin routes (except login page)
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/api')) {
    const authToken = request.cookies.get('admin_session')?.value

    // No token - redirect to login
    if (!authToken) {
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const redirectResponse = NextResponse.redirect(loginUrl)

      // Add security headers to redirect response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }

    // Basic token validation (format check)
    // Full JWT verification happens in API routes/server components
    // Edge runtime has limited crypto capabilities
    if (authToken.length < 10) {
      // Token is too short to be valid
      const loginUrl = new URL('/admin?error=invalid_session', request.url)
      const redirectResponse = NextResponse.redirect(loginUrl)

      // Clear invalid cookies
      redirectResponse.cookies.delete('admin_session')
      redirectResponse.cookies.delete('user_info')

      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }

    // Development token validation
    if (authToken === 'dev-token') {
      // Only allow dev token in development environment
      const isDev = process.env.NODE_ENV === 'development'
      if (!isDev) {
        // Dev token not allowed in production
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

    // Token exists and passes basic validation
    return response
  }

  // API routes - add CORS headers for auth endpoints
  if (pathname.startsWith('/api/auth')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  // If on login page but already authenticated, redirect to dashboard
  if (pathname === '/admin') {
    const authToken = request.cookies.get('admin_session')?.value
    const redirect = request.nextUrl.searchParams.get('redirect')

    if (authToken && authToken.length > 10) {
      // User appears to be authenticated, redirect to dashboard
      // Full verification will happen on the dashboard page
      const redirectUrl = new URL(redirect || '/admin/dashboard', request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)

      Object.entries(securityHeaders).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
  ],
}
