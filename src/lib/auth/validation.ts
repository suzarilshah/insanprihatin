/**
 * Pure validation functions for authentication
 * These functions have no side effects and can be tested in isolation
 */

/**
 * Email validation regex
 * - Allows alphanumeric characters, dots, underscores, percent, plus, and hyphens in local part
 * - Requires @ symbol
 * - Allows alphanumeric characters, dots, and hyphens in domain
 * - Prohibits consecutive dots in domain
 * - Requires at least 2 character TLD
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

/**
 * Maximum allowed email length per RFC 5321
 */
const MAX_EMAIL_LENGTH = 254

/**
 * Validates email format
 * @param email - The email address to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return false
  }

  return EMAIL_REGEX.test(email)
}

/**
 * Sanitizes email input by converting to lowercase and trimming whitespace
 * @param email - The email address to sanitize
 * @returns Sanitized email string
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  return email.toLowerCase().trim()
}

/**
 * Checks if a user role has admin privileges
 * @param role - The user's role
 * @returns true if user is admin
 */
export function isAdminRole(role: string): boolean {
  return role === 'admin'
}

/**
 * Checks if a user role can edit content
 * @param role - The user's role
 * @returns true if user can edit
 */
export function canEditContent(role: string): boolean {
  return ['admin', 'editor'].includes(role)
}

/**
 * Checks if a user role can view content
 * @param role - The user's role
 * @returns true if user can view
 */
export function canViewContent(role: string): boolean {
  return ['admin', 'editor', 'viewer'].includes(role)
}

/**
 * Validates a token has minimum required length
 * Used for basic format validation before full JWT verification
 * @param token - The token string
 * @param minLength - Minimum required length (default 10)
 * @returns true if token meets minimum length
 */
export function isValidTokenFormat(token: string, minLength = 10): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  return token.length >= minLength
}

/**
 * Checks if a string is the development bypass token
 * @param token - The token to check
 * @returns true if this is the dev token
 */
export function isDevToken(token: string): boolean {
  return token === 'dev-token'
}
