/**
 * Authentication Logger
 * Comprehensive logging utility for auth events with structured output
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
}

class AuthLogger {
  private formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }
  }

  private sanitizeData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return undefined

    // Create a copy to avoid mutating original
    const sanitized = { ...data }

    // Remove sensitive fields
    const sensitiveFields = ['password', 'secret', 'token', 'accessToken', 'refreshToken', 'clientSecret']
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  info(message: string, data?: Record<string, unknown>) {
    const entry = this.formatLog('info', message, this.sanitizeData(data))
    console.log(`[AUTH:INFO] ${entry.timestamp} - ${message}`, data ? JSON.stringify(this.sanitizeData(data)) : '')
  }

  warn(message: string, data?: Record<string, unknown>) {
    const entry = this.formatLog('warn', message, this.sanitizeData(data))
    console.warn(`[AUTH:WARN] ${entry.timestamp} - ${message}`, data ? JSON.stringify(this.sanitizeData(data)) : '')
  }

  error(message: string, data?: Record<string, unknown>) {
    const entry = this.formatLog('error', message, this.sanitizeData(data))
    console.error(`[AUTH:ERROR] ${entry.timestamp} - ${message}`, data ? JSON.stringify(this.sanitizeData(data)) : '')
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatLog('debug', message, this.sanitizeData(data))
      console.debug(`[AUTH:DEBUG] ${entry.timestamp} - ${message}`, data ? JSON.stringify(this.sanitizeData(data)) : '')
    }
  }

  /**
   * Audit log for compliance and security tracking
   * These logs should be preserved for security audits
   */
  audit(action: string, userId: string, details: Record<string, unknown>) {
    const sanitized = this.sanitizeData(details)
    console.log(
      `[AUTH:AUDIT] ${new Date().toISOString()} - Action: ${action}, User: ${userId}`,
      JSON.stringify(sanitized)
    )
  }

  /**
   * Log security-relevant events that may need investigation
   */
  security(event: string, data: Record<string, unknown>) {
    const sanitized = this.sanitizeData(data)
    console.warn(
      `[AUTH:SECURITY] ${new Date().toISOString()} - Event: ${event}`,
      JSON.stringify(sanitized)
    )
  }
}

export const authLogger = new AuthLogger()
