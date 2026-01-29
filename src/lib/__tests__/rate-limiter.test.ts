/**
 * Rate Limiter Tests
 * Comprehensive tests for rate limiting functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  RateLimiter,
  MemoryRateLimitStore,
  createRateLimiter,
  DEFAULT_RATE_LIMIT_CONFIG,
} from '../auth/rate-limiter'

describe('MemoryRateLimitStore', () => {
  let store: MemoryRateLimitStore

  beforeEach(() => {
    store = new MemoryRateLimitStore()
  })

  it('should set and get records', () => {
    const record = { count: 1, lastAttempt: Date.now() }
    store.set('test-id', record)

    expect(store.get('test-id')).toEqual(record)
  })

  it('should return undefined for non-existent keys', () => {
    expect(store.get('non-existent')).toBeUndefined()
  })

  it('should delete records', () => {
    store.set('test-id', { count: 1, lastAttempt: Date.now() })
    store.delete('test-id')

    expect(store.get('test-id')).toBeUndefined()
  })

  it('should clear all records', () => {
    store.set('id1', { count: 1, lastAttempt: Date.now() })
    store.set('id2', { count: 2, lastAttempt: Date.now() })
    store.clear()

    expect(store.get('id1')).toBeUndefined()
    expect(store.get('id2')).toBeUndefined()
    expect(store.size()).toBe(0)
  })

  it('should track size', () => {
    expect(store.size()).toBe(0)

    store.set('id1', { count: 1, lastAttempt: Date.now() })
    expect(store.size()).toBe(1)

    store.set('id2', { count: 1, lastAttempt: Date.now() })
    expect(store.size()).toBe(2)

    store.delete('id1')
    expect(store.size()).toBe(1)
  })
})

describe('RateLimiter', () => {
  let limiter: RateLimiter
  let store: MemoryRateLimitStore

  beforeEach(() => {
    store = new MemoryRateLimitStore()
    limiter = new RateLimiter({
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      store,
    })
  })

  describe('check()', () => {
    it('should allow first attempt', () => {
      const result = limiter.check('user-1')

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(4)
      expect(result.retryAfter).toBeUndefined()
    })

    it('should decrement remaining attempts', () => {
      limiter.check('user-1')
      const result = limiter.check('user-1')

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(3)
    })

    it('should block after max attempts', () => {
      const now = Date.now()

      // Use all 5 attempts
      for (let i = 0; i < 5; i++) {
        limiter.check('user-1', now)
      }

      // 6th attempt should be blocked
      const result = limiter.check('user-1', now)

      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should calculate correct retry after time', () => {
      const now = Date.now()
      const windowMs = 15 * 60 * 1000 // 15 minutes

      // Use all attempts
      for (let i = 0; i < 5; i++) {
        limiter.check('user-1', now)
      }

      // Check immediately after - should wait full window
      const result = limiter.check('user-1', now)
      expect(result.retryAfter).toBe(Math.ceil(windowMs / 1000))

      // Check 5 minutes later
      const later = now + 5 * 60 * 1000
      const result2 = limiter.check('user-1', later)
      expect(result2.retryAfter).toBe(Math.ceil((windowMs - 5 * 60 * 1000) / 1000))
    })

    it('should reset after window expires', () => {
      const now = Date.now()
      const windowMs = 15 * 60 * 1000

      // Use all attempts
      for (let i = 0; i < 5; i++) {
        limiter.check('user-1', now)
      }

      // After window expires
      const afterWindow = now + windowMs + 1000
      const result = limiter.check('user-1', afterWindow)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(4)
    })

    it('should track different identifiers separately', () => {
      // User 1 uses 4 attempts
      for (let i = 0; i < 4; i++) {
        limiter.check('user-1')
      }

      // User 2 should have full quota
      const result = limiter.check('user-2')

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(4)
    })
  })

  describe('reset()', () => {
    it('should reset attempts for identifier', () => {
      // Use some attempts
      limiter.check('user-1')
      limiter.check('user-1')
      limiter.check('user-1')

      // Reset
      limiter.reset('user-1')

      // Should have full quota again
      const result = limiter.check('user-1')
      expect(result.remainingAttempts).toBe(4)
    })

    it('should not affect other identifiers', () => {
      limiter.check('user-1')
      limiter.check('user-2')

      limiter.reset('user-1')

      // User 2 should still have reduced quota
      const result = limiter.check('user-2')
      expect(result.remainingAttempts).toBe(3)
    })
  })

  describe('isBlocked()', () => {
    it('should return false when not blocked', () => {
      expect(limiter.isBlocked('user-1')).toBe(false)
    })

    it('should return true when blocked', () => {
      const now = Date.now()

      // Use all attempts
      for (let i = 0; i < 5; i++) {
        limiter.check('user-1', now)
      }

      expect(limiter.isBlocked('user-1', now)).toBe(true)
    })

    it('should not increment count when checking', () => {
      // Use 4 attempts (1 remaining)
      for (let i = 0; i < 4; i++) {
        limiter.check('user-1')
      }

      // Check if blocked multiple times
      limiter.isBlocked('user-1')
      limiter.isBlocked('user-1')
      limiter.isBlocked('user-1')

      // Should still have 1 remaining
      const result = limiter.check('user-1')
      expect(result.remainingAttempts).toBe(0) // 0 because we just used the last one
    })
  })

  describe('getRemainingAttempts()', () => {
    it('should return max attempts for new identifier', () => {
      expect(limiter.getRemainingAttempts('user-1')).toBe(5)
    })

    it('should return remaining attempts', () => {
      limiter.check('user-1')
      limiter.check('user-1')

      expect(limiter.getRemainingAttempts('user-1')).toBe(3)
    })

    it('should return 0 when blocked', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('user-1')
      }

      expect(limiter.getRemainingAttempts('user-1')).toBe(0)
    })

    it('should return max after window expires', () => {
      const now = Date.now()

      limiter.check('user-1', now)
      limiter.check('user-1', now)

      const afterWindow = now + 15 * 60 * 1000 + 1000
      expect(limiter.getRemainingAttempts('user-1', afterWindow)).toBe(5)
    })
  })

  describe('clearAll()', () => {
    it('should clear all records', () => {
      limiter.check('user-1')
      limiter.check('user-2')
      limiter.check('user-3')

      limiter.clearAll()

      expect(store.size()).toBe(0)
      expect(limiter.getRemainingAttempts('user-1')).toBe(5)
      expect(limiter.getRemainingAttempts('user-2')).toBe(5)
      expect(limiter.getRemainingAttempts('user-3')).toBe(5)
    })
  })
})

describe('RateLimiter with custom config', () => {
  it('should use custom max attempts', () => {
    const limiter = createRateLimiter({ maxAttempts: 3 })

    limiter.check('user-1')
    limiter.check('user-1')
    limiter.check('user-1')

    const result = limiter.check('user-1')
    expect(result.allowed).toBe(false)
  })

  it('should use custom window', () => {
    const limiter = createRateLimiter({
      maxAttempts: 5,
      windowMs: 1000, // 1 second
    })
    const now = Date.now()

    // Use all attempts
    for (let i = 0; i < 5; i++) {
      limiter.check('user-1', now)
    }

    // Should be blocked
    expect(limiter.check('user-1', now).allowed).toBe(false)

    // After 1 second, should be allowed
    expect(limiter.check('user-1', now + 1001).allowed).toBe(true)
  })
})

describe('createRateLimiter', () => {
  it('should create a rate limiter with default config', () => {
    const limiter = createRateLimiter()

    // Should use default 5 attempts
    for (let i = 0; i < 5; i++) {
      const result = limiter.check('user-1')
      expect(result.allowed).toBe(true)
    }

    expect(limiter.check('user-1').allowed).toBe(false)
  })

  it('should allow custom store', () => {
    const customStore = new MemoryRateLimitStore()
    const limiter = createRateLimiter({ store: customStore })

    limiter.check('user-1')
    expect(customStore.size()).toBe(1)
  })
})

describe('DEFAULT_RATE_LIMIT_CONFIG', () => {
  it('should have correct defaults', () => {
    expect(DEFAULT_RATE_LIMIT_CONFIG.maxAttempts).toBe(5)
    expect(DEFAULT_RATE_LIMIT_CONFIG.windowMs).toBe(15 * 60 * 1000)
  })
})

describe('Real-world scenarios', () => {
  it('should handle login brute force attempt', () => {
    const limiter = createRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 })
    const attackerIP = '192.168.1.100'
    const now = Date.now()

    // Attacker tries 5 rapid login attempts
    for (let i = 0; i < 5; i++) {
      const result = limiter.check(attackerIP, now + i)
      expect(result.allowed).toBe(true)
    }

    // 6th attempt should be blocked
    const blocked = limiter.check(attackerIP, now + 5)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('should allow legitimate user after successful login', () => {
    const limiter = createRateLimiter()
    const userIP = '10.0.0.50'

    // User makes 3 failed attempts
    limiter.check(userIP)
    limiter.check(userIP)
    limiter.check(userIP)

    // User successfully logs in - reset their limit
    limiter.reset(userIP)

    // Should have full quota again
    const result = limiter.check(userIP)
    expect(result.remainingAttempts).toBe(4)
  })

  it('should handle multiple users with different states', () => {
    const limiter = createRateLimiter({ maxAttempts: 3 })
    const now = Date.now()

    // User A: blocked
    limiter.check('user-a', now)
    limiter.check('user-a', now)
    limiter.check('user-a', now)

    // User B: 1 attempt
    limiter.check('user-b', now)

    // User C: fresh
    // (no checks)

    expect(limiter.isBlocked('user-a', now)).toBe(true)
    expect(limiter.getRemainingAttempts('user-b')).toBe(2)
    expect(limiter.getRemainingAttempts('user-c')).toBe(3)
  })
})
