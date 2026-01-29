/**
 * Auth Module Exports
 *
 * This module provides authentication utilities organized into:
 * - validation: Pure functions for input validation
 * - csrf: CSRF token generation and OAuth state management
 * - rate-limiter: Rate limiting with configurable store
 */

// Validation functions
export {
  isValidEmail,
  sanitizeEmail,
  isAdminRole,
  canEditContent,
  canViewContent,
  isValidTokenFormat,
  isDevToken,
} from './validation'

// CSRF and OAuth state functions
export {
  generateCSRFToken,
  generateNonce,
  createOAuthState,
  decodeOAuthState,
  verifyOAuthState,
  emailsMatch,
  DEFAULT_STATE_MAX_AGE_MS,
} from './csrf'

// Rate limiting
export {
  RateLimiter,
  MemoryRateLimitStore,
  createRateLimiter,
  getDefaultRateLimiter,
  checkRateLimit,
  resetRateLimit,
  DEFAULT_RATE_LIMIT_CONFIG,
  type RateLimitStore,
  type RateLimiterConfig,
} from './rate-limiter'

// Re-export types
export type {
  AuthUser,
  RateLimitResult,
  RateLimitRecord,
  OAuthStateResult,
  OAuthStatePayload,
  CookieOptions,
  LoginRequest,
  LoginSuccessResponse,
  LoginErrorResponse,
  AuthErrorCode,
} from '@/lib/types/auth'

export { AUTH_ERROR_MESSAGES } from '@/lib/types/auth'
