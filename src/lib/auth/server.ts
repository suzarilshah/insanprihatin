/**
 * Server-side Auth Utilities
 *
 * Provides backward-compatible functions for server actions and API routes.
 * Uses NextAuth.js under the hood.
 */

import { auth } from './config'
import { authLogger } from './logger'

/**
 * Auth User type compatible with existing code
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

/**
 * Get the current session
 * Wrapper around NextAuth auth() for backward compatibility
 */
export async function getSession() {
  const session = await auth()
  return session
}

/**
 * Require authentication for server actions
 * Throws an error if the user is not authenticated
 *
 * @returns AuthUser compatible object
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const session = await auth()

  if (!session || !session.user) {
    authLogger.warn('Unauthorized access attempt', {
      timestamp: new Date().toISOString(),
    })
    throw new Error('Unauthorized')
  }

  // Verify user has the required group (defense in depth)
  const groups = (session as { groups?: string[] }).groups || []
  const webadminGroupId = process.env.WEBADMIN_GROUP_ID

  if (!webadminGroupId || !groups.includes(webadminGroupId)) {
    authLogger.security('UNAUTHORIZED_SERVER_ACTION', {
      email: session.user.email,
      reason: 'User not in webadmin group',
      timestamp: new Date().toISOString(),
    })
    throw new Error('Forbidden')
  }

  // Return AuthUser compatible object
  return {
    id: session.user.id || session.user.email || 'unknown',
    email: session.user.email || '',
    name: session.user.name || 'Unknown',
    role: 'admin', // All webadmin group members are admins
  }
}
