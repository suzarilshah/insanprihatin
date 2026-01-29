/**
 * Validation Module Tests
 * Comprehensive tests for email validation and role checking functions
 */

import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  sanitizeEmail,
  isAdminRole,
  canEditContent,
  canViewContent,
  isValidTokenFormat,
  isDevToken,
} from '../auth/validation'

describe('isValidEmail', () => {
  describe('valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@example.co.uk',
      'admin@insanprihatin.org',
      'test123@test.io',
      'a@b.co',
      'user_name@domain.com',
      'user-name@domain.com',
      'user%name@domain.com',
      'UPPERCASE@DOMAIN.COM',
      'MixedCase@Domain.Com',
    ]

    validEmails.forEach((email) => {
      it(`should accept: ${email}`, () => {
        expect(isValidEmail(email)).toBe(true)
      })
    })
  })

  describe('invalid emails', () => {
    const invalidEmails = [
      '',
      'notanemail',
      '@nolocal.com',
      'noat.domain.com',
      'spaces in@email.com',
      'user@',
      'user@.',
      'user@.com',
      'user@domain',
      'user@domain.c',
      'user@@domain.com',
      'user@domain..com',
    ]

    invalidEmails.forEach((email) => {
      it(`should reject: "${email}"`, () => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('edge cases', () => {
    it('should reject null', () => {
      expect(isValidEmail(null as unknown as string)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(isValidEmail(undefined as unknown as string)).toBe(false)
    })

    it('should reject numbers', () => {
      expect(isValidEmail(123 as unknown as string)).toBe(false)
    })

    it('should reject objects', () => {
      expect(isValidEmail({} as unknown as string)).toBe(false)
    })

    it('should reject emails longer than 254 characters', () => {
      const longEmail = 'a'.repeat(243) + '@example.com' // 255 chars
      expect(isValidEmail(longEmail)).toBe(false)
    })

    it('should accept emails at exactly 254 characters', () => {
      const maxEmail = 'a'.repeat(242) + '@example.com' // 254 chars
      expect(isValidEmail(maxEmail)).toBe(true)
    })
  })
})

describe('sanitizeEmail', () => {
  describe('lowercase conversion', () => {
    it('should convert uppercase to lowercase', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should convert mixed case to lowercase', () => {
      expect(sanitizeEmail('TeSt@ExAmPlE.CoM')).toBe('test@example.com')
    })

    it('should not change already lowercase emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
    })
  })

  describe('whitespace trimming', () => {
    it('should trim leading whitespace', () => {
      expect(sanitizeEmail('  test@example.com')).toBe('test@example.com')
    })

    it('should trim trailing whitespace', () => {
      expect(sanitizeEmail('test@example.com  ')).toBe('test@example.com')
    })

    it('should trim both leading and trailing whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should trim tabs', () => {
      expect(sanitizeEmail('\ttest@example.com\t')).toBe('test@example.com')
    })

    it('should trim newlines', () => {
      expect(sanitizeEmail('\ntest@example.com\n')).toBe('test@example.com')
    })
  })

  describe('edge cases', () => {
    it('should return empty string for null', () => {
      expect(sanitizeEmail(null as unknown as string)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(sanitizeEmail(undefined as unknown as string)).toBe('')
    })

    it('should return empty string for non-strings', () => {
      expect(sanitizeEmail(123 as unknown as string)).toBe('')
    })

    it('should handle empty string', () => {
      expect(sanitizeEmail('')).toBe('')
    })

    it('should handle whitespace-only string', () => {
      expect(sanitizeEmail('   ')).toBe('')
    })
  })
})

describe('isAdminRole', () => {
  it('should return true for admin role', () => {
    expect(isAdminRole('admin')).toBe(true)
  })

  it('should return false for editor role', () => {
    expect(isAdminRole('editor')).toBe(false)
  })

  it('should return false for viewer role', () => {
    expect(isAdminRole('viewer')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isAdminRole('')).toBe(false)
  })

  it('should be case-sensitive', () => {
    expect(isAdminRole('Admin')).toBe(false)
    expect(isAdminRole('ADMIN')).toBe(false)
  })
})

describe('canEditContent', () => {
  it('should return true for admin role', () => {
    expect(canEditContent('admin')).toBe(true)
  })

  it('should return true for editor role', () => {
    expect(canEditContent('editor')).toBe(true)
  })

  it('should return false for viewer role', () => {
    expect(canEditContent('viewer')).toBe(false)
  })

  it('should return false for unknown roles', () => {
    expect(canEditContent('unknown')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(canEditContent('')).toBe(false)
  })
})

describe('canViewContent', () => {
  it('should return true for admin role', () => {
    expect(canViewContent('admin')).toBe(true)
  })

  it('should return true for editor role', () => {
    expect(canViewContent('editor')).toBe(true)
  })

  it('should return true for viewer role', () => {
    expect(canViewContent('viewer')).toBe(true)
  })

  it('should return false for unknown roles', () => {
    expect(canViewContent('unknown')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(canViewContent('')).toBe(false)
  })
})

describe('isValidTokenFormat', () => {
  it('should accept tokens longer than default minimum', () => {
    expect(isValidTokenFormat('a'.repeat(50))).toBe(true)
  })

  it('should accept tokens at exactly minimum length', () => {
    expect(isValidTokenFormat('a'.repeat(10))).toBe(true)
  })

  it('should reject tokens shorter than minimum', () => {
    expect(isValidTokenFormat('short')).toBe(false)
  })

  it('should allow custom minimum length', () => {
    expect(isValidTokenFormat('abc', 3)).toBe(true)
    expect(isValidTokenFormat('ab', 3)).toBe(false)
  })

  it('should reject null', () => {
    expect(isValidTokenFormat(null as unknown as string)).toBe(false)
  })

  it('should reject undefined', () => {
    expect(isValidTokenFormat(undefined as unknown as string)).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidTokenFormat('')).toBe(false)
  })
})

describe('isDevToken', () => {
  it('should return true for dev-token', () => {
    expect(isDevToken('dev-token')).toBe(true)
  })

  it('should return false for other tokens', () => {
    expect(isDevToken('real-jwt-token-here')).toBe(false)
  })

  it('should be case-sensitive', () => {
    expect(isDevToken('Dev-Token')).toBe(false)
    expect(isDevToken('DEV-TOKEN')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isDevToken('')).toBe(false)
  })

  it('should return false for partial match', () => {
    expect(isDevToken('dev-')).toBe(false)
    expect(isDevToken('dev-token-extra')).toBe(false)
  })
})
