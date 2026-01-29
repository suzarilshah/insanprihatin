import { NextRequest, NextResponse } from 'next/server'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user is an authorized admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'This email is not authorized to access the admin portal' },
        { status: 403 }
      )
    }

    if (!adminUser.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated' },
        { status: 403 }
      )
    }

    // Construct Neon Auth URL for magic link
    const neonAuthUrl = process.env.NEON_AUTH_URL
    if (!neonAuthUrl) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      )
    }

    // Build the authorization URL
    const authUrl = new URL(`${neonAuthUrl}/authorize`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', 'neon-auth')
    authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`)
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('login_hint', email)
    authUrl.searchParams.set('state', Buffer.from(JSON.stringify({ email })).toString('base64'))

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      message: 'Please check your email for the login link',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
