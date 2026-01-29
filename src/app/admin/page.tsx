'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter?: number } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        auth_failed: 'Authentication failed. Please try again.',
        unauthorized: 'You are not authorized to access the admin portal.',
        invalid_credentials: 'Invalid email or password.',
        account_disabled: 'Your account has been disabled. Contact support.',
        invalid_session: 'Your session is invalid. Please log in again.',
        config_error: 'System configuration error. Please contact support.',
      }
      setError(errorMessages[errorParam] || 'An error occurred. Please try again.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setRateLimitInfo(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          setRateLimitInfo({ retryAfter: data.retryAfter })
        }
        setError(data.error || 'An error occurred')
        return
      }

      if (data.success && data.redirect) {
        // Redirect to dashboard
        window.location.href = data.redirect
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Development-only bypass login
  const handleDevLogin = () => {
    if (!isDevelopment) {
      setError('Development login is not available in production.')
      return
    }

    document.cookie = `user_info=${JSON.stringify({
      id: 'dev-user',
      email: 'admin@insanprihatin.org',
      name: 'System Administrator',
      role: 'admin',
    })};path=/;max-age=86400;samesite=lax`
    document.cookie = 'admin_session=dev-token;path=/;max-age=86400;samesite=lax'
    window.location.href = '/admin/dashboard'
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@insanprihatin.org"
          className="input-elegant"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="input-elegant"
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
        >
          {error}
          {rateLimitInfo?.retryAfter && (
            <p className="mt-1 text-xs text-red-500">
              Please wait {Math.ceil(rateLimitInfo.retryAfter / 60)} minutes before trying again.
            </p>
          )}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-gray-500 text-xs">
        Only authorized administrators can access this portal.
        <br />
        Contact IT support if you need access.
      </p>

      {/* Development bypass - only shown in development mode */}
      {isDevelopment && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-center text-gray-400 text-xs mb-2">
            Development Mode Only
          </p>
          <button
            type="button"
            onClick={handleDevLogin}
            className="w-full py-2 px-4 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Skip Authentication (Dev Only)
          </button>
        </div>
      )}
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foundation-charcoal via-gray-900 to-foundation-charcoal p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal-600/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-amber-400/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-elevated p-10">
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src="/images/logo.png"
                alt="Yayasan Insan Prihatin"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="font-display text-2xl font-bold text-foundation-charcoal">
              Admin Portal
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Yayasan Insan Prihatin
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Secure Admin Authentication
        </p>
      </motion.div>
    </div>
  )
}
