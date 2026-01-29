/**
 * Authentication Types
 * Shared types for the authentication system
 */

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  retryAfter?: number
}

/**
 * OAuth state verification result
 */
export interface OAuthStateResult {
  email: string
  valid: boolean
}

/**
 * OAuth state payload (encoded in state parameter)
 */
export interface OAuthStatePayload {
  email: string
  csrf: string
  timestamp: number
  nonce: string
}

/**
 * Rate limit record stored in memory
 */
export interface RateLimitRecord {
  count: number
  lastAttempt: number
}

/**
 * Cookie configuration options
 */
export interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  path: string
  maxAge: number
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string
}

/**
 * Login response on success
 */
export interface LoginSuccessResponse {
  success: true
  authUrl: string
  message: string
}

/**
 * Login response on error
 */
export interface LoginErrorResponse {
  error: string
  retryAfter?: number
}

/**
 * Auth callback error codes
 */
export type AuthErrorCode =
  | 'auth_failed'
  | 'unauthorized'
  | 'no_code'
  | 'token_exchange_failed'
  | 'callback_failed'
  | 'invalid_state'
  | 'email_mismatch'
  | 'account_disabled'
  | 'invalid_session'
  | 'config_error'
  | 'no_email'

/**
 * Error messages for auth error codes
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  auth_failed: 'Authentication failed. Please try again.',
  unauthorized: 'You are not authorized to access the admin portal.',
  no_code: 'Invalid authentication response.',
  token_exchange_failed: 'Failed to verify your identity. Please try again.',
  callback_failed: 'An error occurred during login. Please try again.',
  invalid_state: 'Session expired. Please try again.',
  email_mismatch: 'Email verification failed. Please try again.',
  account_disabled: 'Your account has been disabled. Contact support.',
  invalid_session: 'Your session is invalid. Please log in again.',
  config_error: 'System configuration error. Please contact support.',
  no_email: 'No email address found in authentication response.',
}
