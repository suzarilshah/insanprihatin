import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

const JWKS = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!))

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle auth errors
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(
        new URL('/admin?error=auth_failed', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin?error=no_code', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    // Exchange code for token
    const tokenUrl = `${process.env.NEON_AUTH_URL}/token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        client_id: 'neon-auth',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(
        new URL('/admin?error=token_exchange_failed', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    const tokens = await tokenResponse.json()
    const { id_token, access_token } = tokens

    // Verify the ID token
    const { payload } = await jwtVerify(id_token, JWKS, {
      issuer: process.env.NEON_AUTH_URL,
    })

    const email = payload.email as string
    if (!email) {
      return NextResponse.redirect(
        new URL('/admin?error=no_email', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    // Verify user is an admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.redirect(
        new URL('/admin?error=unauthorized', process.env.NEXT_PUBLIC_SITE_URL)
      )
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id))

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Store user info in a separate cookie for client access
    cookieStore.set('user_info', JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    // Redirect to dashboard
    return NextResponse.redirect(
      new URL('/admin/dashboard', process.env.NEXT_PUBLIC_SITE_URL)
    )
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/admin?error=callback_failed', process.env.NEXT_PUBLIC_SITE_URL)
    )
  }
}
