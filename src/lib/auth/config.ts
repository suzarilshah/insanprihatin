/**
 * NextAuth.js Configuration
 * Microsoft Entra ID (Azure AD) SSO with group-based access control
 */

import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { authLogger } from './logger'

// Extend types for group claims
declare module 'next-auth' {
  interface Profile {
    groups?: string[]
    oid?: string
  }

  interface Session {
    groups?: string[]
    accessToken?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    groups?: string[]
    accessToken?: string
  }
}

/**
 * Decode a JWT token to extract its payload
 * Note: This only decodes, it does NOT verify the signature
 * (NextAuth already verifies the token)
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(jsonPayload)
  } catch (error) {
    authLogger.error('Failed to decode JWT payload', { error: String(error) })
    return null
  }
}

// Validate required environment variables
function validateConfig() {
  const required = [
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'AZURE_AD_TENANT_ID',
    'WEBADMIN_GROUP_ID',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    authLogger.error('Missing required environment variables', { missing })
    throw new Error(`Missing required auth config: ${missing.join(', ')}`)
  }
}

// Only validate in server context
if (typeof window === 'undefined') {
  try {
    validateConfig()
  } catch (error) {
    // Log but don't throw during module load - will throw at runtime when needed
    authLogger.error('Auth configuration validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign in, extract group claims from the ID token
      if (account && profile) {
        token.accessToken = account.access_token

        // Groups are in the ID token, not the userinfo profile
        // We need to decode the id_token to get them
        let groups: string[] = []

        if (account.id_token) {
          const idTokenPayload = decodeJwtPayload(account.id_token)
          if (idTokenPayload && Array.isArray(idTokenPayload.groups)) {
            groups = idTokenPayload.groups as string[]
          }

          authLogger.info('JWT callback - decoded ID token', {
            email: profile.email,
            hasGroups: !!idTokenPayload?.groups,
            groupCount: groups.length,
            groups: groups,
          })
        } else {
          authLogger.warn('JWT callback - no id_token in account', {
            email: profile.email,
          })
        }

        token.groups = groups

        authLogger.info('JWT callback - processing sign-in', {
          email: profile.email,
          oid: profile.oid,
          groupCount: token.groups.length,
          hasWebadminGroup: token.groups.includes(process.env.WEBADMIN_GROUP_ID || ''),
        })
      }
      return token
    },

    async session({ session, token }) {
      // Make groups available in session for client-side checks if needed
      session.groups = token.groups
      session.accessToken = token.accessToken
      return session
    },

    async signIn({ user, account }) {
      const webadminGroupId = process.env.WEBADMIN_GROUP_ID

      // Validate environment configuration
      if (!webadminGroupId) {
        authLogger.error('WEBADMIN_GROUP_ID not configured', {
          email: user.email,
        })
        return '/admin?error=configuration'
      }

      // Extract groups from the ID token (same as jwt callback)
      let groups: string[] = []

      if (account?.id_token) {
        const idTokenPayload = decodeJwtPayload(account.id_token)
        if (idTokenPayload) {
          authLogger.info('DEBUG - Full ID token payload', {
            email: user.email,
            payloadKeys: Object.keys(idTokenPayload),
            groups: idTokenPayload.groups,
            hasgroups: idTokenPayload.hasgroups,
            _claim_names: idTokenPayload._claim_names,
          })

          if (Array.isArray(idTokenPayload.groups)) {
            groups = idTokenPayload.groups as string[]
          }
        }
      } else {
        authLogger.warn('signIn callback - no id_token available', {
          email: user.email,
          accountProvider: account?.provider,
        })
      }

      const isAuthorized = groups.includes(webadminGroupId)

      authLogger.info('Sign-in attempt', {
        email: user.email,
        name: user.name,
        isAuthorized,
        groupCount: groups.length,
        groups: groups,
        requiredGroupId: webadminGroupId,
        timestamp: new Date().toISOString(),
      })

      if (!isAuthorized) {
        authLogger.security('UNAUTHORIZED_ACCESS_ATTEMPT', {
          email: user.email,
          name: user.name,
          reason: 'User not in webadmin group',
          userGroupCount: groups.length,
          requiredGroup: webadminGroupId,
          timestamp: new Date().toISOString(),
        })
        return '/admin?error=unauthorized'
      }

      authLogger.info('Access GRANTED', {
        email: user.email,
        name: user.name,
        timestamp: new Date().toISOString(),
      })

      return true
    },
  },

  pages: {
    signIn: '/admin',
    error: '/admin',
  },

  events: {
    async signIn({ user, account }) {
      authLogger.audit('USER_SIGN_IN', user.email || 'unknown', {
        name: user.name,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      })
    },
    async signOut(message) {
      // Handle both session and token based signOut
      const email = 'token' in message
        ? (message.token?.email as string)
        : 'session' in message
          ? 'unknown'
          : 'unknown'
      authLogger.audit('USER_SIGN_OUT', email || 'unknown', {
        timestamp: new Date().toISOString(),
      })
    },
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',

  // Trust the host header in production
  trustHost: true,
})
