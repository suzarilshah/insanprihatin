/**
 * CSRF Protection and OAuth State Management
 * Pure functions for creating and verifying security tokens
 */

import crypto from 'crypto'
import type { OAuthStatePayload, OAuthStateResult } from '@/lib/types/auth'

/**
 * Default maximum age for OAuth state (5 minutes)
 */
export const DEFAULT_STATE_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Generates a cryptographically secure CSRF token
 * @param bytes - Number of random bytes (default 32)
 * @returns Hex-encoded CSRF token
 */
export function generateCSRFToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Generates a cryptographically secure nonce
 * @param bytes - Number of random bytes (default 16)
 * @returns Hex-encoded nonce
 */
export function generateNonce(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Creates an OAuth state parameter containing email, CSRF token, timestamp, and nonce
 * @param email - User's email address
 * @param csrfToken - CSRF token for verification
 * @param timestamp - Optional timestamp (defaults to current time)
 * @param nonce - Optional nonce (defaults to generated nonce)
 * @returns Base64url-encoded state string
 */
export function createOAuthState(
  email: string,
  csrfToken: string,
  timestamp?: number,
  nonce?: string
): string {
  const state: OAuthStatePayload = {
    email,
    csrf: csrfToken,
    timestamp: timestamp ?? Date.now(),
    nonce: nonce ?? generateNonce(),
  }

  return Buffer.from(JSON.stringify(state)).toString('base64url')
}

/**
 * Decodes an OAuth state string into its payload
 * @param state - Base64url-encoded state string
 * @returns Decoded payload or null if invalid
 */
export function decodeOAuthState(state: string): OAuthStatePayload | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString()
    const payload = JSON.parse(decoded) as OAuthStatePayload

    // Validate required fields exist
    if (
      typeof payload.email !== 'string' ||
      typeof payload.csrf !== 'string' ||
      typeof payload.timestamp !== 'number' ||
      typeof payload.nonce !== 'string'
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Verifies an OAuth state parameter
 * @param state - Base64url-encoded state string
 * @param expectedCSRF - Expected CSRF token
 * @param currentTime - Current timestamp for expiration check (defaults to Date.now())
 * @param maxAgeMs - Maximum age in milliseconds (defaults to 5 minutes)
 * @returns Verification result with email and validity
 */
export function verifyOAuthState(
  state: string,
  expectedCSRF: string,
  currentTime?: number,
  maxAgeMs = DEFAULT_STATE_MAX_AGE_MS
): OAuthStateResult {
  const payload = decodeOAuthState(state)

  if (!payload) {
    return { email: '', valid: false }
  }

  // Verify CSRF token matches
  if (payload.csrf !== expectedCSRF) {
    return { email: '', valid: false }
  }

  // Verify state hasn't expired
  const now = currentTime ?? Date.now()
  if (now - payload.timestamp > maxAgeMs) {
    return { email: '', valid: false }
  }

  return { email: payload.email, valid: true }
}

/**
 * Checks if two emails match (case-insensitive)
 * @param email1 - First email
 * @param email2 - Second email
 * @returns true if emails match
 */
export function emailsMatch(email1: string, email2: string): boolean {
  return email1.toLowerCase() === email2.toLowerCase()
}
