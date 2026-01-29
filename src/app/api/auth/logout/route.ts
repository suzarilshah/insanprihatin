import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth-server'

export async function POST() {
  try {
    await clearSession()

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Prevent caching of logout response
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    await clearSession()

    // Redirect to login page with cache control
    const response = NextResponse.redirect(new URL('/admin', siteUrl))
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Even on error, redirect to login
    return NextResponse.redirect(new URL('/admin', siteUrl))
  }
}
