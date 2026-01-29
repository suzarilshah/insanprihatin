import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Clear all auth-related cookies
async function clearAuthCookies() {
  const cookieStore = await cookies()

  // Delete all auth-related cookies
  cookieStore.delete('auth_token')
  cookieStore.delete('user_info')
  cookieStore.delete('csrf_token')
}

export async function POST() {
  try {
    await clearAuthCookies()

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
    await clearAuthCookies()

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
