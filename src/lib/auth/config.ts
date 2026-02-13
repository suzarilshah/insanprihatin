/**
 * NextAuth.js Configuration
 * Microsoft Entra ID (Azure AD) SSO with email-based access control
 * (Business Basic doesn't support security groups, so we use allowed email list)
 */

import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { authLogger } from './logger'

// Extend types for session
declare module 'next-auth' {
  interface Profile {
    oid?: string
  }

  interface Session {
    accessToken?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    accessToken?: string
  }
}

// Validate required environment variables
function validateConfig() {
  const required = [
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'AZURE_AD_TENANT_ID',
    'ALLOWED_ADMIN_EMAILS',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    authLogger.error('Missing required environment variables', { missing })
    throw new Error(`Missing required auth config: ${missing.join(', ')}`)
  }
}

/**
 * Get list of allowed admin emails from environment variable
 */
function getAllowedAdminEmails(): string[] {
  const emails = process.env.ALLOWED_ADMIN_EMAILS || ''
  return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
}

/**
 * Check if an email is in the allowed admin list
 */
function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  const allowedEmails = getAllowedAdminEmails()
  return allowedEmails.includes(email.toLowerCase())
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
      // On initial sign in, store access token and email
      if (account && profile) {
        token.accessToken = account.access_token
        token.email = profile.email

        authLogger.info('JWT callback - processing sign-in', {
          email: profile.email,
          oid: profile.oid,
          isAllowedAdmin: isEmailAllowed(profile.email),
        })
      }
      return token
    },

    async session({ session, token }) {
      // Make access token available in session if needed
      session.accessToken = token.accessToken
      return session
    },

    async signIn({ user }) {
      // Validate environment configuration
      const allowedEmails = getAllowedAdminEmails()
      if (allowedEmails.length === 0) {
        authLogger.error('ALLOWED_ADMIN_EMAILS not configured', {
          email: user.email,
        })
        return '/admin?error=configuration'
      }

      // Check if user's email is in the allowed list
      const isAuthorized = isEmailAllowed(user.email)

      authLogger.info('Sign-in attempt', {
        email: user.email,
        name: user.name,
        isAuthorized,
        allowedEmailsCount: allowedEmails.length,
        timestamp: new Date().toISOString(),
      })

      if (!isAuthorized) {
        authLogger.security('UNAUTHORIZED_ACCESS_ATTEMPT', {
          email: user.email,
          name: user.name,
          reason: 'User email not in allowed admin list',
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
