/**
 * Enhanced Logging Utility
 *
 * Provides structured logging for better debugging and monitoring.
 * In production, these logs can be sent to external services like
 * Sentry, LogRocket, or CloudWatch.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'

// Format log entry for console output
function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}]`
  let output = `${prefix} ${entry.message}`

  if (entry.context && Object.keys(entry.context).length > 0) {
    // Mask sensitive data
    const maskedContext = maskSensitiveData(entry.context)
    output += `\n  Context: ${JSON.stringify(maskedContext, null, 2)}`
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
    if (entry.error.stack && !isProduction) {
      output += `\n  Stack: ${entry.error.stack}`
    }
  }

  return output
}

// Mask sensitive data in logs
function maskSensitiveData(data: LogContext): LogContext {
  const sensitiveKeys = ['email', 'phone', 'password', 'token', 'secret', 'key', 'authorization']
  const masked: LogContext = {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      if (typeof value === 'string' && value.length > 0) {
        // Show first 3 and last 2 characters
        if (value.length > 8) {
          masked[key] = `${value.slice(0, 3)}***${value.slice(-2)}`
        } else {
          masked[key] = '***'
        }
      } else {
        masked[key] = '***'
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value as LogContext)
    } else {
      masked[key] = value
    }
  }

  return masked
}

// Create a logger for a specific module
export function createLogger(module: string) {
  const log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    const formattedEntry = formatLogEntry(entry)

    switch (level) {
      case 'debug':
        if (!isProduction) console.debug(formattedEntry)
        break
      case 'info':
        console.info(formattedEntry)
        break
      case 'warn':
        console.warn(formattedEntry)
        break
      case 'error':
        console.error(formattedEntry)
        break
    }

    // In production, you could send to external logging service here
    // e.g., Sentry.captureMessage(message, { level, extra: context })
  }

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),

    // Convenience method for request logging
    request: (requestId: string, action: string, context?: LogContext) => {
      log('info', `[${requestId}] ${action}`, context)
    },

    // Convenience method for starting an operation
    startOperation: (operationName: string, context?: LogContext) => {
      const startTime = Date.now()
      log('info', `Starting: ${operationName}`, context)

      return {
        success: (message?: string, additionalContext?: LogContext) => {
          const duration = Date.now() - startTime
          log('info', `Completed: ${operationName}${message ? ` - ${message}` : ''}`, {
            ...additionalContext,
            durationMs: duration,
          })
        },
        failure: (error: Error, additionalContext?: LogContext) => {
          const duration = Date.now() - startTime
          log('error', `Failed: ${operationName}`, {
            ...additionalContext,
            durationMs: duration,
          }, error)
        },
      }
    },
  }
}

// Pre-configured loggers for common modules
export const donationLogger = createLogger('Donation')
export const toyyibpayLogger = createLogger('ToyyibPay')
export const webhookLogger = createLogger('Webhook')
export const adminLogger = createLogger('Admin')
export const authLogger = createLogger('Auth')
