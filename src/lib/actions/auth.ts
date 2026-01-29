'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'

export async function login(email: string) {
  // Check if user is an authorized admin
  const adminUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email.toLowerCase()),
  })

  if (!adminUser) {
    return { error: 'This email is not authorized to access the admin portal' }
  }

  if (!adminUser.isActive) {
    return { error: 'Your account has been deactivated' }
  }

  // Construct Neon Auth URL
  const neonAuthUrl = process.env.NEON_AUTH_URL
  if (!neonAuthUrl) {
    return { error: 'Authentication service not configured' }
  }

  const authUrl = new URL(`${neonAuthUrl}/authorize`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', 'neon-auth')
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`)
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('login_hint', email)

  return { authUrl: authUrl.toString() }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('user_info')
  redirect('/admin')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userInfo = cookieStore.get('user_info')?.value

  if (!userInfo) {
    return null
  }

  try {
    return JSON.parse(userInfo)
  } catch {
    return null
  }
}
