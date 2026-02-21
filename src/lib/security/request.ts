import { NextRequest, NextResponse } from 'next/server'

function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin
  } catch {
    return value
  }
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    origins.add(normalizeOrigin(siteUrl))
  }

  // Support local development without weakening production.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://localhost:3001')
    origins.add('http://localhost:3002')
    origins.add('http://127.0.0.1:3000')
  }

  return origins
}

function extractRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (origin) return normalizeOrigin(origin)

  const referer = request.headers.get('referer')
  if (!referer) return null

  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

/**
 * Basic CSRF mitigation for API routes that rely on cookie auth:
 * only allow state-changing requests from trusted same-site origins.
 */
export function enforceTrustedOrigin(request: NextRequest): NextResponse | null {
  const requestOrigin = extractRequestOrigin(request)
  const allowedOrigins = getAllowedOrigins(request)

  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    )
  }

  return null
}
