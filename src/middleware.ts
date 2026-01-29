import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing protected admin routes (except login page)
  if (pathname.startsWith('/admin/dashboard')) {
    const authToken = request.cookies.get('auth_token')?.value

    if (!authToken) {
      // Redirect to login page
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Token exists, allow access (full verification happens in the page)
    return NextResponse.next()
  }

  // If on login page but already authenticated, redirect to dashboard
  if (pathname === '/admin') {
    const authToken = request.cookies.get('auth_token')?.value
    const redirect = request.nextUrl.searchParams.get('redirect')

    if (authToken) {
      // User is authenticated, redirect to dashboard or requested page
      const redirectUrl = new URL(redirect || '/admin/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
