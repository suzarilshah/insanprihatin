import { jwtVerify, createRemoteJWKSet } from 'jose'
import { cookies } from 'next/headers'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'

const JWKS = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!))

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.NEON_AUTH_URL,
    })

    const email = payload.email as string
    if (!email) return null

    // Check if user is admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email),
    })

    if (!adminUser || !adminUser.isActive) return null

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role || 'editor',
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin'
}

export function canEdit(user: AuthUser): boolean {
  return ['admin', 'editor'].includes(user.role)
}
