/**
 * Rate Limiting Module
 * Provides configurable rate limiting with injectable store for testability
 */

import type { RateLimitResult, RateLimitRecord } from '@/lib/types/auth'

/**
 * Interface for rate limit storage
 * Allows for different storage backends (memory, Redis, etc.)
 */
export interface RateLimitStore {
  get(key: string): RateLimitRecord | undefined
  set(key: string, value: RateLimitRecord): void
  delete(key: string): void
  clear(): void
}

/**
 * In-memory rate limit store implementation
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitRecord>()

  get(key: string): RateLimitRecord | undefined {
    return this.store.get(key)
  }

  set(key: string, value: RateLimitRecord): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  /**
   * Get the number of tracked identifiers
   */
  size(): number {
    return this.store.size
  }
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  maxAttempts: number
  windowMs: number
  store?: RateLimitStore
}

/**
 * Default rate limiter configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimiterConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Rate Limiter class with configurable store and limits
 */
export class RateLimiter {
  private store: RateLimitStore
  private maxAttempts: number
  private windowMs: number

  constructor(config: Partial<RateLimiterConfig> = {}) {
    const mergedConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config }
    this.store = mergedConfig.store ?? new MemoryRateLimitStore()
    this.maxAttempts = mergedConfig.maxAttempts
    this.windowMs = mergedConfig.windowMs
  }

  /**
   * Check if an identifier is rate limited
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @param currentTime - Current timestamp (defaults to Date.now())
   * @returns Rate limit check result
   */
  check(identifier: string, currentTime?: number): RateLimitResult {
    const now = currentTime ?? Date.now()
    const record = this.store.get(identifier)

    // Clean expired records
    if (record && now - record.lastAttempt > this.windowMs) {
      this.store.delete(identifier)
    }

    const current = this.store.get(identifier)

    // First attempt
    if (!current) {
      this.store.set(identifier, { count: 1, lastAttempt: now })
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts - 1,
      }
    }

    // Check if blocked
    if (current.count >= this.maxAttempts) {
      const retryAfter = Math.ceil(
        (this.windowMs - (now - current.lastAttempt)) / 1000
      )
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfter: Math.max(0, retryAfter),
      }
    }

    // Increment attempt count
    current.count++
    current.lastAttempt = now
    this.store.set(identifier, current)

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - current.count,
    }
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Check if an identifier is currently blocked
   * @param identifier - Unique identifier to check
   * @param currentTime - Current timestamp (defaults to Date.now())
   * @returns true if blocked
   */
  isBlocked(identifier: string, currentTime?: number): boolean {
    const result = this.check(identifier, currentTime)
    // Undo the count increment from check
    if (result.allowed) {
      const record = this.store.get(identifier)
      if (record && record.count > 1) {
        record.count--
        this.store.set(identifier, record)
      }
    }
    return !result.allowed
  }

  /**
   * Get remaining attempts for an identifier without incrementing
   * @param identifier - Unique identifier to check
   * @param currentTime - Current timestamp (defaults to Date.now())
   * @returns Number of remaining attempts
   */
  getRemainingAttempts(identifier: string, currentTime?: number): number {
    const now = currentTime ?? Date.now()
    const record = this.store.get(identifier)

    // Clean expired records
    if (record && now - record.lastAttempt > this.windowMs) {
      return this.maxAttempts
    }

    if (!record) {
      return this.maxAttempts
    }

    return Math.max(0, this.maxAttempts - record.count)
  }

  /**
   * Clear all rate limit records
   */
  clearAll(): void {
    this.store.clear()
  }
}

/**
 * Create a rate limiter with custom configuration
 * @param config - Rate limiter configuration
 * @returns Configured rate limiter instance
 */
export function createRateLimiter(
  config: Partial<RateLimiterConfig> = {}
): RateLimiter {
  return new RateLimiter(config)
}

// Default global rate limiter instance for backward compatibility
let defaultRateLimiter: RateLimiter | null = null

/**
 * Get the default rate limiter instance
 * Creates one if it doesn't exist
 */
export function getDefaultRateLimiter(): RateLimiter {
  if (!defaultRateLimiter) {
    defaultRateLimiter = new RateLimiter()
  }
  return defaultRateLimiter
}

/**
 * Check rate limit using the default rate limiter
 * @param identifier - Unique identifier
 * @param maxAttempts - Optional override for max attempts
 * @param windowMs - Optional override for window duration
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): RateLimitResult {
  // Create a custom rate limiter with the specified config
  const limiter = new RateLimiter({ maxAttempts, windowMs })
  return limiter.check(identifier)
}

/**
 * Reset rate limit for an identifier
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  getDefaultRateLimiter().reset(identifier)
}
