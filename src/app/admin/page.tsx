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
 * Error messages for different authentication scenarios
 */
const errorMessages: Record<string, string> = {
  unauthorized:
    'You are not authorized to access the admin portal. Please contact IT support if you need access.',
  configuration: 'System configuration error. Please contact IT support.',
  OAuthSignin: 'Error starting the sign-in process. Please try again.',
  OAuthCallback: 'Error during authentication callback. Please try again.',
  OAuthAccountNotLinked: 'This Microsoft account is not linked to an admin account.',
  SessionRequired: 'Please sign in to access this page.',
  Callback: 'Error during authentication. Please try again.',
  AccessDenied: 'Access denied. You do not have permission to access this resource.',
  Default: 'An unexpected error occurred. Please try again.',
}

/**
 * Login Content Component
 * Handles the SSO sign-in flow
 */
function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('redirect') || '/admin/dashboard'

  const handleSignIn = () => {
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
          Enter your organization credentials to access the dashboard.
        </p>
      </div>

      {/* Microsoft Sign In Button */}
      <div className="space-y-4">
        <button
          onClick={handleSignIn}
          className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          <MicrosoftLogo />
          <span>Sign in with Microsoft 365</span>
          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 group-hover:ring-black/10" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Secured Access</span>
          </div>
        </div>
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
