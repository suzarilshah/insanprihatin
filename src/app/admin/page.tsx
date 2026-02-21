'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

/**
 * Microsoft Logo Component
 * Official Microsoft brand colors
 */
function MicrosoftLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

/**
 * Google Logo Component
 * Official Google brand colors
 */
function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/**
 * Error messages for different authentication scenarios
 */
const errorMessages: Record<string, string> = {
  unauthorized:
    'You are not authorized to access the admin portal. Only @insanprihatin.org accounts are allowed.',
  unverified:
    'Your email address is not verified. Please verify your email and try again.',
  configuration: 'System configuration error. Please contact IT support.',
  OAuthSignin: 'Error starting the sign-in process. Please try again.',
  OAuthCallback: 'Error during authentication callback. Please try again.',
  OAuthAccountNotLinked: 'This account is not linked to an admin account.',
  SessionRequired: 'Please sign in to access this page.',
  Callback: 'Error during authentication. Please try again.',
  AccessDenied: 'Access denied. You do not have permission to access this resource.',
  Default: 'An unexpected error occurred. Please try again.',
}

/**
 * Login Content Component
 * Handles the SSO sign-in flow with multiple providers
 */
function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('redirect') || '/admin/dashboard'

  const handleGoogleSignIn = () => {
    console.log('[AUTH:LOGIN] Initiating Google sign-in')
    signIn('google', { callbackUrl })
  }

  const handleMicrosoftSignIn = () => {
    console.log('[AUTH:LOGIN] Initiating Microsoft sign-in')
    signIn('microsoft-entra-id', { callbackUrl })
  }

  return (
    <div className="space-y-8 w-full max-w-sm">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/50 backdrop-blur-sm border border-red-200/60 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-red-800 font-medium text-sm">Access Denied</p>
              <p className="text-red-600 text-xs mt-1 leading-relaxed">
                {errorMessages[error] || errorMessages.Default}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Login Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">
          Sign in with your @insanprihatin.org account to access the dashboard.
        </p>
      </div>

      {/* SSO Sign In Buttons */}
      <div className="space-y-3">
        {/* Google Sign In - Primary */}
        <button
          onClick={handleGoogleSignIn}
          className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 py-3.5 px-4 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          <GoogleLogo />
          <span>Sign in with Google Workspace</span>
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 group-hover:ring-black/10" />
        </button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">or</span>
          </div>
        </div>

        {/* Microsoft Sign In - Secondary */}
        <button
          onClick={handleMicrosoftSignIn}
          className="group relative w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 hover:border-gray-200 py-3 px-4 rounded-xl font-medium transition-all duration-200 active:scale-[0.99]"
        >
          <MicrosoftLogo />
          <span>Sign in with Microsoft 365</span>
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/[0.03] group-hover:ring-black/5" />
        </button>
      </div>

      {/* Domain Restriction Notice */}
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-50/50 border border-teal-100 rounded-lg">
        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-xs text-teal-700 font-medium">
          Only @insanprihatin.org accounts can access this portal
        </span>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-4">
        <p className="text-xs text-gray-400">
          By signing in, you agree to the{' '}
          <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/**
 * Admin Login Page
 * Split layout with cinematic visuals
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Column: Visuals */}
      <div className="hidden lg:flex relative bg-black flex-col justify-between p-12 overflow-hidden">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-900/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        </div>
        
        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo.png"
                alt="YIP"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <span className="font-semibold tracking-tight">Yayasan Insan Prihatin</span>
          </div>
        </div>

        {/* Quote/Content */}
        <div className="relative z-10 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-3xl font-medium leading-tight text-white">
              &ldquo;Empowering communities through sustainable development and compassionate action.&rdquo;
            </p>
            <footer className="text-sm text-gray-400">
              — Foundation Mission
            </footer>
          </blockquote>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 flex items-center gap-6 text-sm text-gray-500">
          <span>© 2026 YIP Foundation</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>Admin Portal v2.0</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 bg-white relative">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="lg:hidden absolute top-8 left-8">
          <div className="relative w-10 h-10">
            <Image
              src="/images/logo.png"
              alt="YIP"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Suspense fallback={<LoadingSpinner />}>
            <LoginContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
