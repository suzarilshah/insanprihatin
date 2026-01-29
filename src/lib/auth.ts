import { jwtVerify, createRemoteJWKSet } from 'jose'
import { cookies } from 'next/headers'
import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// Cache JWKS to avoid repeated fetches
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS() {
  if (!jwksCache && process.env.NEON_AUTH_JWKS_URL) {
    jwksCache = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL))
  }
  return jwksCache
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// Verify JWT token against Neon Auth JWKS
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const JWKS = getJWKS()
    if (!JWKS) {
      console.error('JWKS not configured')
      return null
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.NEON_AUTH_URL,
    })

    const email = payload.email as string
    if (!email) {
      console.error('No email in token payload')
      return null
    }

    // Verify user exists and is an active admin
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser) {
      console.error('User not found in admin_users table')
      return null
    }

    if (!adminUser.isActive) {
      console.error('User account is deactivated')
      return null
    }

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

// Get current session from cookies
export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null

    // In development with dev token, validate against database
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      const userInfoCookie = cookieStore.get('user_info')?.value
      if (userInfoCookie) {
        try {
          const userInfo = JSON.parse(userInfoCookie)
          // Verify this is actually a valid admin user in database
          const adminUser = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.email, userInfo.email.toLowerCase()),
          })
          if (adminUser && adminUser.isActive) {
            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role || 'editor',
            }
          }
        } catch {
          return null
        }
      }
      return null
    }

    return await verifyToken(token)
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Check if user has admin role
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin'
}

// Check if user can edit content
export function canEdit(user: AuthUser): boolean {
  return ['admin', 'editor'].includes(user.role)
}

// Generate secure CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create secure state parameter for OAuth
export function createOAuthState(email: string, csrfToken: string): string {
  const state = {
    email,
    csrf: csrfToken,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  }
  return Buffer.from(JSON.stringify(state)).toString('base64url')
}

// Verify OAuth state parameter
export function verifyOAuthState(state: string, expectedCSRF: string): { email: string; valid: boolean } {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())

    // Check CSRF token matches
    if (decoded.csrf !== expectedCSRF) {
      console.error('CSRF token mismatch')
      return { email: '', valid: false }
    }

    // Check state isn't too old (5 minutes max)
    const maxAge = 5 * 60 * 1000 // 5 minutes
    if (Date.now() - decoded.timestamp > maxAge) {
      console.error('OAuth state expired')
      return { email: '', valid: false }
    }

    return { email: decoded.email, valid: true }
  } catch (error) {
    console.error('Failed to verify OAuth state:', error)
    return { email: '', valid: false }
  }
}

// Secure cookie options
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 5, // 5 minutes - short lived for OAuth flow
}

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remainingAttempts: number; retryAfter?: number } {
  const now = Date.now()
  const record = loginAttempts.get(identifier)

  // Clean old records
  if (record && now - record.lastAttempt > windowMs) {
    loginAttempts.delete(identifier)
  }

  const current = loginAttempts.get(identifier)

  if (!current) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  if (current.count >= maxAttempts) {
    const retryAfter = Math.ceil((windowMs - (now - current.lastAttempt)) / 1000)
    return { allowed: false, remainingAttempts: 0, retryAfter }
  }

  current.count++
  current.lastAttempt = now
  loginAttempts.set(identifier, current)

  return { allowed: true, remainingAttempts: maxAttempts - current.count }
}

// Reset rate limit on successful login
export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier)
}

// Validate email format securely
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// Sanitize email input
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}
