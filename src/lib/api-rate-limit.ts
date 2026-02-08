/**
 * API Rate Limiting Utility
 *
 * Provides rate limiting for API routes using an in-memory store.
 * For production with multiple instances, consider using Redis.
 *
 * SECURITY: Prevents abuse of public endpoints like contact forms,
 * donation creation, and form submissions.
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number      // Maximum requests allowed
  windowMs: number         // Time window in milliseconds
  message?: string         // Custom error message
}

interface RateLimitEntry {
  count: number
  firstRequest: number
}

// In-memory store for rate limiting
// Note: This resets on server restart and doesn't work across multiple instances
// For production scale, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupOldEntries(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  const cutoff = now - windowMs

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.firstRequest < cutoff) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get client identifier for rate limiting
 * Uses X-Forwarded-For header (from reverse proxy) or falls back to a generic key
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // Get the first IP in the chain (original client)
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - not ideal but better than nothing
  return 'unknown-client'
}

/**
 * Check rate limit for a request
 * @returns null if allowed, NextResponse if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const { maxRequests, windowMs, message } = config
  const clientId = getClientIdentifier(request)
  const now = Date.now()

  // Cleanup old entries occasionally
  cleanupOldEntries(windowMs)

  // Get or create entry for this client
  const entry = rateLimitStore.get(clientId)

  if (!entry) {
    // First request from this client
    rateLimitStore.set(clientId, { count: 1, firstRequest: now })
    return null // Allowed
  }

  // Check if window has expired
  if (now - entry.firstRequest > windowMs) {
    // Reset the window
    rateLimitStore.set(clientId, { count: 1, firstRequest: now })
    return null // Allowed
  }

  // Check if over limit
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.firstRequest + windowMs - now) / 1000)

    console.warn(`[RateLimit] Client ${clientId} exceeded rate limit (${entry.count}/${maxRequests})`)

    return NextResponse.json(
      {
        error: message || 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.firstRequest + windowMs).toISOString(),
        },
      }
    )
  }

  // Increment count
  entry.count++
  rateLimitStore.set(clientId, entry)

  return null // Allowed
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  // Contact form: 5 submissions per 15 minutes
  contactForm: (request: NextRequest) =>
    checkRateLimit(request, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      message: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
    }),

  // Form submissions: 10 per 15 minutes
  formSubmission: (request: NextRequest) =>
    checkRateLimit(request, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
      message: 'Too many form submissions. Please wait before trying again.',
    }),

  // Donation creation: 10 per hour (legitimate users rarely need more)
  donationCreate: (request: NextRequest) =>
    checkRateLimit(request, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
      message: 'Too many donation attempts. Please wait before trying again.',
    }),

  // Test endpoints: 3 per minute
  testEndpoint: (request: NextRequest) =>
    checkRateLimit(request, {
      maxRequests: 3,
      windowMs: 60 * 1000,
      message: 'Too many test requests. Please wait a minute.',
    }),

  // General API: 100 per minute
  general: (request: NextRequest) =>
    checkRateLimit(request, {
      maxRequests: 100,
      windowMs: 60 * 1000,
    }),
}
