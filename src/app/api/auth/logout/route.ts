import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear auth cookies
    cookieStore.delete('auth_token')
    cookieStore.delete('user_info')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Clear auth cookies
    cookieStore.delete('auth_token')
    cookieStore.delete('user_info')

    // Redirect to login page
    return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL))
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL))
  }
}
