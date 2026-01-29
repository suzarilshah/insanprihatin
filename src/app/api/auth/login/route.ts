import { NextRequest, NextResponse } from 'next/server'
import {
  authenticateAdmin,
  createSession,
  setSessionCookie,
} from '@/lib/auth-server'
import {
  checkRateLimit,
  isValidEmail,
  sanitizeEmail,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.`,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter!.toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { email: rawEmail, password } = body

    if (!rawEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize email
    if (!isValidEmail(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const email = sanitizeEmail(rawEmail)

    // Authenticate the admin user
    const authResult = await authenticateAdmin(email, password)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSession(authResult.user)

    // Set session cookie
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      redirect: '/admin/dashboard',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
