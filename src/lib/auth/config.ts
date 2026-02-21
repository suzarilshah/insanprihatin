/**
 * NextAuth.js Configuration
 * Multiple SSO providers with domain-based access control:
 * - Microsoft Entra ID (Azure AD)
 * - Google Workspace (@insanprihatin.org domain)
 */

import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import Google from 'next-auth/providers/google'
import { authLogger } from './logger'

// Extend types for session
declare module 'next-auth' {
  interface Profile {
    oid?: string
    email_verified?: boolean | null
    hd?: string // Google Workspace domain
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

// Allowed Google Workspace domain
const ALLOWED_GOOGLE_DOMAIN = 'insanprihatin.org'

// Validate required environment variables
function validateConfig() {
  // Check if at least one provider is configured
  const hasMicrosoft = process.env.AZURE_AD_CLIENT_ID &&
                       process.env.AZURE_AD_CLIENT_SECRET &&
                       process.env.AZURE_AD_TENANT_ID

  const hasGoogle = process.env.GOOGLE_CLIENT_ID &&
                    process.env.GOOGLE_CLIENT_SECRET

  if (!hasMicrosoft && !hasGoogle) {
    authLogger.error('No authentication provider configured')
    throw new Error('At least one authentication provider must be configured')
  }

  // ALLOWED_ADMIN_EMAILS is optional when using Google Workspace domain restriction
  if (!process.env.ALLOWED_ADMIN_EMAILS && !hasGoogle) {
    authLogger.warn('ALLOWED_ADMIN_EMAILS not set - only Google Workspace users can login')
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

// Build providers array dynamically based on available configuration
const providers = []

// Add Microsoft Entra ID if configured
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    })
  )
}

// Add Google if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          // Restrict to Google Workspace domain
          hd: ALLOWED_GOOGLE_DOMAIN,
        },
      },
    })
  )
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers,

  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign in, store access token and email
      if (account && profile) {
        token.accessToken = account.access_token
        token.email = profile.email

        authLogger.info('JWT callback - processing sign-in', {
          email: profile.email,
          provider: account.provider,
          oid: profile.oid,
          hd: profile.hd, // Google Workspace domain
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

    async signIn({ user, account, profile }) {
      const email = user.email
      const provider = account?.provider || 'unknown'

      authLogger.info('Sign-in attempt', {
        email,
        name: user.name,
        provider,
        timestamp: new Date().toISOString(),
      })

      // For Google sign-in: verify domain restriction
      if (provider === 'google') {
        const googleProfile = profile as { hd?: string; email_verified?: boolean }

        // Check if email is verified
        if (!googleProfile?.email_verified) {
          authLogger.security('UNVERIFIED_EMAIL', {
            email,
            provider,
            timestamp: new Date().toISOString(),
          })
          return '/admin?error=unverified'
        }

        // Check Google Workspace domain (hd = hosted domain)
        if (googleProfile?.hd !== ALLOWED_GOOGLE_DOMAIN) {
          authLogger.security('UNAUTHORIZED_DOMAIN', {
            email,
            domain: googleProfile?.hd || 'personal account',
            allowedDomain: ALLOWED_GOOGLE_DOMAIN,
            timestamp: new Date().toISOString(),
          })
          return '/admin?error=unauthorized'
        }

        // Google Workspace users from correct domain are automatically allowed
        authLogger.info('Access GRANTED (Google Workspace)', {
          email,
          domain: googleProfile.hd,
          timestamp: new Date().toISOString(),
        })
        return true
      }

      // For Microsoft sign-in: check allowed emails list
      if (provider === 'microsoft-entra-id') {
        const allowedEmails = getAllowedAdminEmails()

        if (allowedEmails.length === 0) {
          authLogger.error('ALLOWED_ADMIN_EMAILS not configured for Microsoft login', {
            email,
          })
          return '/admin?error=configuration'
        }

        const isAuthorized = isEmailAllowed(email)

        if (!isAuthorized) {
          authLogger.security('UNAUTHORIZED_ACCESS_ATTEMPT', {
            email,
            name: user.name,
            provider,
            reason: 'User email not in allowed admin list',
            timestamp: new Date().toISOString(),
          })
          return '/admin?error=unauthorized'
        }

        authLogger.info('Access GRANTED (Microsoft)', {
          email,
          name: user.name,
          timestamp: new Date().toISOString(),
        })
        return true
      }

      // Unknown provider - deny access
      authLogger.security('UNKNOWN_PROVIDER', {
        email,
        provider,
        timestamp: new Date().toISOString(),
      })
      return '/admin?error=unauthorized'
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
