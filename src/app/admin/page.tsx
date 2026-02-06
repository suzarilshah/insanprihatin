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
    'You are not authorized to access the admin portal. Only members of the webadmin group can sign in.',
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
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
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
              <p className="text-red-600 text-sm mt-1">
                {errorMessages[error] || errorMessages.Default}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Microsoft Sign In Button */}
      <button
        onClick={handleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] text-white py-4 px-6 rounded-xl font-medium transition-all hover:shadow-lg active:scale-[0.98]"
      >
        <MicrosoftLogo />
        Sign in with Microsoft 365
      </button>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-gray-500 text-sm">
          Sign in with your{' '}
          <span className="font-medium">@insanprihatin.org</span> account
        </p>
        <p className="text-gray-400 text-xs">
          Only members of the webadmin group can access this portal
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
    <div className="text-center py-4">
      <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mx-auto" />
    </div>
  )
}

/**
 * Admin Login Page
 * Microsoft Entra ID SSO authentication
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foundation-charcoal via-gray-900 to-foundation-charcoal p-6">
      {/* Background Effects */}
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
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src="/images/logo.png"
                alt="Yayasan Insan Prihatin"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="font-display text-2xl font-bold text-foundation-charcoal">
              Admin Portal
            </h1>
            <p className="text-gray-500 text-sm mt-1">Yayasan Insan Prihatin</p>
          </div>

          {/* Login Form */}
          <Suspense fallback={<LoadingSpinner />}>
            <LoginContent />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-500 text-xs">Secured with Microsoft Entra ID</p>
          <p className="text-gray-600 text-xs">
            Need help?{' '}
            <a
              href="mailto:it@insanprihatin.org"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Contact IT Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
