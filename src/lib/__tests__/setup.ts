/**
 * Test Setup
 * Global test configuration and utilities
 */

import { beforeEach, afterEach, vi } from 'vitest'

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Mock console.error to suppress expected error logs in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

// Freeze time for deterministic tests when needed
export function freezeTime(timestamp: number) {
  vi.useFakeTimers()
  vi.setSystemTime(timestamp)
}

export function unfreezeTime() {
  vi.useRealTimers()
}
