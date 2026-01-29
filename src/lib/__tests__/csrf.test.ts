/**
 * CSRF and OAuth State Tests
 * Comprehensive tests for security token generation and verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateCSRFToken,
  generateNonce,
  createOAuthState,
  decodeOAuthState,
  verifyOAuthState,
  emailsMatch,
  DEFAULT_STATE_MAX_AGE_MS,
} from '../auth/csrf'

describe('generateCSRFToken', () => {
  it('should generate a hex string', () => {
    const token = generateCSRFToken()
    expect(token).toMatch(/^[a-f0-9]+$/)
  })

  it('should generate 64 character token by default (32 bytes)', () => {
    const token = generateCSRFToken()
    expect(token).toHaveLength(64)
  })

  it('should generate different tokens each time', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateCSRFToken())
    }
    expect(tokens.size).toBe(100)
  })

  it('should accept custom byte length', () => {
    const token16 = generateCSRFToken(16)
    expect(token16).toHaveLength(32) // 16 bytes = 32 hex chars

    const token64 = generateCSRFToken(64)
    expect(token64).toHaveLength(128) // 64 bytes = 128 hex chars
  })
})

describe('generateNonce', () => {
  it('should generate a hex string', () => {
    const nonce = generateNonce()
    expect(nonce).toMatch(/^[a-f0-9]+$/)
  })

  it('should generate 32 character nonce by default (16 bytes)', () => {
    const nonce = generateNonce()
    expect(nonce).toHaveLength(32)
  })

  it('should generate different nonces each time', () => {
    const nonces = new Set<string>()
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce())
    }
    expect(nonces.size).toBe(100)
  })

  it('should accept custom byte length', () => {
    const nonce8 = generateNonce(8)
    expect(nonce8).toHaveLength(16) // 8 bytes = 16 hex chars
  })
})

describe('createOAuthState', () => {
  const testEmail = 'test@example.com'
  const testCSRF = 'test-csrf-token'
  const testTimestamp = 1700000000000
  const testNonce = 'test-nonce-123'

  it('should create a base64url encoded string', () => {
    const state = createOAuthState(testEmail, testCSRF)
    // Base64url uses only alphanumeric, hyphen, and underscore
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('should create decodable state', () => {
    const state = createOAuthState(testEmail, testCSRF)
    const decoded = decodeOAuthState(state)

    expect(decoded).not.toBeNull()
    expect(decoded?.email).toBe(testEmail)
    expect(decoded?.csrf).toBe(testCSRF)
  })

  it('should include timestamp', () => {
    const before = Date.now()
    const state = createOAuthState(testEmail, testCSRF)
    const after = Date.now()

    const decoded = decodeOAuthState(state)
    expect(decoded?.timestamp).toBeGreaterThanOrEqual(before)
    expect(decoded?.timestamp).toBeLessThanOrEqual(after)
  })

  it('should accept custom timestamp', () => {
    const state = createOAuthState(testEmail, testCSRF, testTimestamp)
    const decoded = decodeOAuthState(state)
    expect(decoded?.timestamp).toBe(testTimestamp)
  })

  it('should accept custom nonce', () => {
    const state = createOAuthState(testEmail, testCSRF, testTimestamp, testNonce)
    const decoded = decodeOAuthState(state)
    expect(decoded?.nonce).toBe(testNonce)
  })

  it('should generate unique nonce by default', () => {
    const state1 = createOAuthState(testEmail, testCSRF, testTimestamp)
    const state2 = createOAuthState(testEmail, testCSRF, testTimestamp)

    const decoded1 = decodeOAuthState(state1)
    const decoded2 = decodeOAuthState(state2)

    expect(decoded1?.nonce).not.toBe(decoded2?.nonce)
  })
})

describe('decodeOAuthState', () => {
  it('should decode valid state', () => {
    const payload = {
      email: 'test@example.com',
      csrf: 'csrf-token',
      timestamp: 1700000000000,
      nonce: 'test-nonce',
    }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')

    const decoded = decodeOAuthState(encoded)
    expect(decoded).toEqual(payload)
  })

  it('should return null for invalid base64', () => {
    expect(decodeOAuthState('not-valid-base64!!!')).toBeNull()
  })

  it('should return null for invalid JSON', () => {
    const notJson = Buffer.from('not json').toString('base64url')
    expect(decodeOAuthState(notJson)).toBeNull()
  })

  it('should return null for missing email', () => {
    const payload = {
      csrf: 'csrf-token',
      timestamp: 1700000000000,
      nonce: 'test-nonce',
    }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    expect(decodeOAuthState(encoded)).toBeNull()
  })

  it('should return null for missing csrf', () => {
    const payload = {
      email: 'test@example.com',
      timestamp: 1700000000000,
      nonce: 'test-nonce',
    }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    expect(decodeOAuthState(encoded)).toBeNull()
  })

  it('should return null for missing timestamp', () => {
    const payload = {
      email: 'test@example.com',
      csrf: 'csrf-token',
      nonce: 'test-nonce',
    }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    expect(decodeOAuthState(encoded)).toBeNull()
  })

  it('should return null for missing nonce', () => {
    const payload = {
      email: 'test@example.com',
      csrf: 'csrf-token',
      timestamp: 1700000000000,
    }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    expect(decodeOAuthState(encoded)).toBeNull()
  })

  it('should return null for wrong types', () => {
    const payloads = [
      { email: 123, csrf: 'token', timestamp: 1700000000000, nonce: 'nonce' },
      { email: 'test@test.com', csrf: 123, timestamp: 1700000000000, nonce: 'nonce' },
      { email: 'test@test.com', csrf: 'token', timestamp: 'not-number', nonce: 'nonce' },
      { email: 'test@test.com', csrf: 'token', timestamp: 1700000000000, nonce: 123 },
    ]

    payloads.forEach((payload) => {
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
      expect(decodeOAuthState(encoded)).toBeNull()
    })
  })
})

describe('verifyOAuthState', () => {
  const testEmail = 'test@example.com'
  const testCSRF = 'test-csrf-token'

  it('should verify valid state', () => {
    const now = Date.now()
    const state = createOAuthState(testEmail, testCSRF, now)

    const result = verifyOAuthState(state, testCSRF, now)

    expect(result.valid).toBe(true)
    expect(result.email).toBe(testEmail)
  })

  it('should reject mismatched CSRF token', () => {
    const now = Date.now()
    const state = createOAuthState(testEmail, testCSRF, now)

    const result = verifyOAuthState(state, 'wrong-csrf-token', now)

    expect(result.valid).toBe(false)
    expect(result.email).toBe('')
  })

  it('should reject expired state (after 5 minutes)', () => {
    const createdAt = Date.now()
    const state = createOAuthState(testEmail, testCSRF, createdAt)

    // 5 minutes + 1 second later
    const expiredTime = createdAt + DEFAULT_STATE_MAX_AGE_MS + 1000

    const result = verifyOAuthState(state, testCSRF, expiredTime)

    expect(result.valid).toBe(false)
    expect(result.email).toBe('')
  })

  it('should accept state just before expiration', () => {
    const createdAt = Date.now()
    const state = createOAuthState(testEmail, testCSRF, createdAt)

    // 4 minutes 59 seconds later (just before 5 minute expiration)
    const justBeforeExpiry = createdAt + DEFAULT_STATE_MAX_AGE_MS - 1000

    const result = verifyOAuthState(state, testCSRF, justBeforeExpiry)

    expect(result.valid).toBe(true)
    expect(result.email).toBe(testEmail)
  })

  it('should allow custom max age', () => {
    const createdAt = Date.now()
    const state = createOAuthState(testEmail, testCSRF, createdAt)

    // Custom 1 minute max age
    const customMaxAge = 60 * 1000

    // 30 seconds later - should be valid
    const result1 = verifyOAuthState(state, testCSRF, createdAt + 30000, customMaxAge)
    expect(result1.valid).toBe(true)

    // 2 minutes later - should be expired
    const result2 = verifyOAuthState(state, testCSRF, createdAt + 120000, customMaxAge)
    expect(result2.valid).toBe(false)
  })

  it('should reject invalid state string', () => {
    const result = verifyOAuthState('invalid-state', testCSRF)

    expect(result.valid).toBe(false)
    expect(result.email).toBe('')
  })

  it('should reject empty state', () => {
    const result = verifyOAuthState('', testCSRF)

    expect(result.valid).toBe(false)
    expect(result.email).toBe('')
  })

  it('should use current time if not provided', () => {
    const state = createOAuthState(testEmail, testCSRF)

    // Should be valid immediately
    const result = verifyOAuthState(state, testCSRF)
    expect(result.valid).toBe(true)
  })
})

describe('emailsMatch', () => {
  it('should match identical emails', () => {
    expect(emailsMatch('test@example.com', 'test@example.com')).toBe(true)
  })

  it('should match case-insensitively', () => {
    expect(emailsMatch('TEST@EXAMPLE.COM', 'test@example.com')).toBe(true)
    expect(emailsMatch('Test@Example.Com', 'test@example.com')).toBe(true)
  })

  it('should not match different emails', () => {
    expect(emailsMatch('user1@example.com', 'user2@example.com')).toBe(false)
    expect(emailsMatch('user@example.com', 'user@example.org')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(emailsMatch('', '')).toBe(true)
    expect(emailsMatch('test@example.com', '')).toBe(false)
  })
})

describe('DEFAULT_STATE_MAX_AGE_MS', () => {
  it('should be 5 minutes in milliseconds', () => {
    expect(DEFAULT_STATE_MAX_AGE_MS).toBe(5 * 60 * 1000)
    expect(DEFAULT_STATE_MAX_AGE_MS).toBe(300000)
  })
})
