/**
 * Auth Module Exports
 *
 * Primary authentication via NextAuth.js with Microsoft Entra ID.
 *
 * NOTE: Legacy utilities (csrf, rate-limiter, validation) are available
 * in their respective files but NOT exported here to avoid edge runtime
 * compatibility issues with the middleware.
 */

// ===========================================
// NextAuth.js - Primary Authentication
// ===========================================
export { auth, signIn, signOut, handlers } from './config'
export { authLogger } from './logger'
