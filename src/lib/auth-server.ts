import { db, adminUsers } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

// Session configuration
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds

// Get JWT secret from env or generate a warning
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEON_AUTH_URL || 'insanprihatin-dev-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

// Session payload type
export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

// Auth user type (compatible with action files)
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// Create a session token
export async function createSession(user: {
  id: string
  email: string
  name: string
  role: string
}): Promise<string> {
  const secret = getJWTSecret()
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_EXPIRY)
    .sign(secret)

  return token
}

// Verify and decode a session token
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    }
  } catch {
    return null
  }
}

// Get current session from cookies
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    return await verifySession(sessionToken)
  } catch {
    return null
  }
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY,
  })

  // Also set user info cookie for client-side UI (non-sensitive)
  const session = await verifySession(token)
  if (session) {
    cookieStore.set('user_info', JSON.stringify({
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY,
    })
  }
}

// Clear session cookie
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete('user_info')
  cookieStore.delete('auth_token')
  cookieStore.delete('csrf_token')
}

// Authenticate admin user with email and password
export async function authenticateAdmin(email: string, password: string): Promise<{
  success: boolean
  user?: { id: string; email: string; name: string; role: string }
  error?: string
}> {
  try {
    // Find admin user
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (!adminUser.isActive) {
      return { success: false, error: 'Account has been deactivated' }
    }

    // For now, use a simple password check
    // In production, you should use bcrypt or similar
    const validPassword = await verifyPassword(password, email)
    if (!validPassword) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id))

    return {
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role || 'editor',
      },
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Simple password verification
// For admin users, we'll use a predefined password from env
// In production, implement proper password hashing
async function verifyPassword(password: string, email: string): Promise<boolean> {
  // Get admin password from environment
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  // Check if the password matches
  // You can also implement per-user passwords stored in the database
  if (password === adminPassword) {
    return true
  }

  // Check email-specific password (format: EMAIL_PASSWORD_hash)
  // e.g., ADMIN_INSANPRIHATIN_ORG_PASSWORD=mysecretpass
  const envKey = `ADMIN_${email.replace(/[@.]/g, '_').toUpperCase()}_PASSWORD`
  const specificPassword = process.env[envKey]
  if (specificPassword && password === specificPassword) {
    return true
  }

  return false
}

// Check if user is authenticated admin
export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Verify user still exists and is active
  const adminUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, session.userId),
  })

  if (!adminUser || !adminUser.isActive) {
    await clearSession()
    throw new Error('Session invalid')
  }

  // Return AuthUser format (with id instead of userId)
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  }
}
