/**
 * ToyyibPay Payment Gateway Service
 *
 * Secure server-side integration with ToyyibPay API
 * Handles category creation, bill generation, and payment verification
 *
 * API Reference: https://toyyibpay.com/apireference/
 * Sandbox: https://dev.toyyibpay.com
 */

import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'
import { toyyibpayLogger as logger } from '@/lib/logger'

// ToyyibPay Configuration
const TOYYIBPAY_URL = process.env.TOYYIBPAY_URL || 'https://dev.toyyibpay.com'
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY || ''

// Environment detection - sandbox uses dev.toyyibpay.com
export type ToyyibPayEnvironment = 'sandbox' | 'production'

// Status codes from ToyyibPay
export const TOYYIBPAY_STATUS = {
  SUCCESS: '1',
  PENDING: '2',
  FAILED: '3',
} as const

// Payment channels
export const PAYMENT_CHANNELS = {
  FPX: '0',
  CREDIT_CARD: '1',
  BOTH: '2',
} as const

// Error types for better error handling
export class ToyyibPayError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ToyyibPayError'
  }
}

// Types
export interface CreateCategoryParams {
  catname: string
  catdescription: string
}

export interface CreateCategoryResponse {
  CategoryCode: string
}

export interface CreateBillParams {
  categoryCode: string
  billName: string
  billDescription: string
  billPriceSetting: '0' | '1' // 0 = dynamic, 1 = fixed
  billPayorInfo: '0' | '1' // 0 = no info required, 1 = info required
  billAmount: number // In cents
  billReturnUrl: string
  billCallbackUrl: string
  billExternalReferenceNo: string
  billTo: string
  billEmail: string
  billPhone: string
  billContentEmail?: string
  billPaymentChannel?: '0' | '1' | '2' // 0 = FPX, 1 = Card, 2 = Both
  billChargeToCustomer?: '0' | '1' | '2' // 0 = charge to merchant, 1 = charge FPX to customer, 2 = charge both
}

export interface CreateBillResponse {
  BillCode: string
}

export interface BillTransaction {
  billName: string
  billDescription: string
  billStatus: string
  billAmount: string
  billTo: string
  billEmail: string
  billPhone: string
  billpaymentAmount: string
  billpaymentStatus: string
  billpaymentInvoiceNo: string
  billpaymentChannel: string
  billExternalReferenceNo: string
  transactionId: string
}

export interface WebhookPayload {
  refno?: string
  status?: string
  reason?: string
  billcode?: string
  order_id?: string
  amount?: string
  transaction_id?: string
}

/**
 * ToyyibPay Service Class
 * All methods are static and should only be called server-side
 */
export class ToyyibPayService {
  /**
   * Validate that ToyyibPay is configured
   */
  static isConfigured(): boolean {
    return !!(TOYYIBPAY_URL && TOYYIBPAY_SECRET_KEY)
  }

  /**
   * Get the ToyyibPay base URL
   */
  static getBaseUrl(): string {
    return TOYYIBPAY_URL
  }

  /**
   * Detect if we're using sandbox or production environment
   * Sandbox URL contains 'dev.' prefix
   */
  static getEnvironment(): ToyyibPayEnvironment {
    const url = TOYYIBPAY_URL.toLowerCase()
    if (url.includes('dev.toyyibpay') || url.includes('sandbox') || url.includes('localhost')) {
      return 'sandbox'
    }
    return 'production'
  }

  /**
   * Check if currently in sandbox mode
   */
  static isSandbox(): boolean {
    return this.getEnvironment() === 'sandbox'
  }

  /**
   * Get the payment URL for a bill
   */
  static getPaymentUrl(billCode: string): string {
    return `${TOYYIBPAY_URL}/${billCode}`
  }

  /**
   * Create a new category in ToyyibPay
   * Categories are used to group bills (e.g., per project)
   */
  static async createCategory(params: CreateCategoryParams): Promise<string> {
    const operation = logger.startOperation('createCategory', {
      categoryName: params.catname,
    })

    if (!this.isConfigured()) {
      operation.failure(new Error('ToyyibPay is not configured'), { code: 'NOT_CONFIGURED' })
      throw new ToyyibPayError('ToyyibPay is not configured', 'NOT_CONFIGURED')
    }

    const apiUrl = `${TOYYIBPAY_URL}/index.php/api/createCategory`

    try {
      const formData = new URLSearchParams({
        userSecretKey: TOYYIBPAY_SECRET_KEY,
        catname: params.catname,
        catdescription: params.catdescription,
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()

      // ToyyibPay returns an array with a single object
      if (Array.isArray(result) && result[0]?.CategoryCode) {
        const categoryCode = result[0].CategoryCode
        operation.success('Category created', { categoryCode })
        return categoryCode
      }

      // Check for error response
      if (result.error || result.msg) {
        const errorMsg = result.msg || result.error || 'Failed to create category'
        operation.failure(new Error(errorMsg), { code: 'CATEGORY_CREATE_FAILED' })
        throw new ToyyibPayError(errorMsg, 'CATEGORY_CREATE_FAILED', result)
      }

      operation.failure(new Error('Unexpected response'), { code: 'UNEXPECTED_RESPONSE' })
      throw new ToyyibPayError('Unexpected response from ToyyibPay', 'UNEXPECTED_RESPONSE', result)
    } catch (error) {
      if (error instanceof ToyyibPayError) throw error
      operation.failure(error as Error, { code: 'CONNECTION_ERROR' })
      throw new ToyyibPayError(
        'Failed to connect to ToyyibPay',
        'CONNECTION_ERROR',
        error
      )
    }
  }

  /**
   * Get or create the General Fund category
   * This category is used for donations not tied to a specific project
   */
  static async getOrCreateGeneralFundCategory(): Promise<string> {
    // Use environment-specific key to avoid sandbox/production conflicts
    const environment = this.getEnvironment()
    const SETTING_KEY = `toyyibpay_general_fund_category_${environment}`

    const operation = logger.startOperation('getOrCreateGeneralFundCategory', {
      environment,
      settingKey: SETTING_KEY,
      baseUrl: TOYYIBPAY_URL,
      configured: this.isConfigured(),
    })

    // Step 1: Check database for existing category (environment-specific)
    let existing
    try {
      logger.debug('Querying database for existing category')
      existing = await db.query.siteSettings.findFirst({
        where: eq(siteSettings.key, SETTING_KEY),
      })
      logger.debug('Database query completed', { found: !!existing })
    } catch (dbError) {
      operation.failure(dbError as Error, { step: 'database_query' })
      throw new ToyyibPayError(
        'Database error while fetching category',
        'DATABASE_ERROR',
        dbError
      )
    }

    // Return existing category if found and matches current environment
    if (existing?.value) {
      const storedData = existing.value as { code: string; environment?: string }
      const categoryCode = storedData?.code
      // Verify the stored category is for the current environment
      if (categoryCode && (!storedData.environment || storedData.environment === environment)) {
        operation.success('Using existing category', { categoryCode })
        return categoryCode
      } else {
        logger.info('Stored category is for different environment, creating new one')
      }
    }

    // Step 2: Create new category in ToyyibPay
    logger.info('Creating new General Fund category')
    let categoryCode: string

    try {
      categoryCode = await this.createCategory({
        catname: 'General Fund',
        catdescription: 'General donations to Yayasan Insan Prihatin',
      })
      logger.info('Category created successfully', { categoryCode })
    } catch (apiError) {
      logger.error('Failed to create category', { step: 'api_call' }, apiError as Error)
      throw apiError // Re-throw API errors as-is
    }

    // Step 3: Store the category code in database (with environment info)
    try {
      logger.debug('Storing category code in database')
      const valueToStore = {
        code: categoryCode,
        environment,
        createdAt: new Date().toISOString(),
      }
      await db.insert(siteSettings).values({
        key: SETTING_KEY,
        value: valueToStore,
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: valueToStore,
          updatedAt: new Date(),
        },
      })
      operation.success('Category created and stored', { categoryCode, environment })
    } catch (dbInsertError) {
      logger.warn('Failed to store category code, proceeding anyway', {
        categoryCode,
        error: (dbInsertError as Error).message,
      })
      // Still return the category code - payment can proceed even if storage fails
      // The category will be recreated on next request (ToyyibPay handles duplicates)
    }

    return categoryCode
  }

  /**
   * Create a new bill in ToyyibPay
   * Bills are invoices that customers pay
   */
  static async createBill(params: CreateBillParams): Promise<string> {
    const operation = logger.startOperation('createBill', {
      billName: params.billName,
      amount: params.billAmount,
      categoryCode: params.categoryCode,
      reference: params.billExternalReferenceNo,
    })

    if (!this.isConfigured()) {
      operation.failure(new Error('ToyyibPay is not configured'), { code: 'NOT_CONFIGURED' })
      throw new ToyyibPayError('ToyyibPay is not configured', 'NOT_CONFIGURED')
    }

    // Validate required fields
    if (!params.categoryCode) {
      throw new ToyyibPayError('Category code is required', 'INVALID_PARAMS')
    }
    if (!params.billName || params.billName.length > 30) {
      throw new ToyyibPayError('Bill name is required and must be max 30 characters', 'INVALID_PARAMS')
    }
    if (!params.billAmount || params.billAmount < 100) { // Minimum RM 1.00
      throw new ToyyibPayError('Bill amount must be at least RM 1.00', 'INVALID_PARAMS')
    }

    const apiUrl = `${TOYYIBPAY_URL}/index.php/api/createBill`

    try {
      const formData = new URLSearchParams({
        userSecretKey: TOYYIBPAY_SECRET_KEY,
        categoryCode: params.categoryCode,
        billName: params.billName.substring(0, 30), // Max 30 chars
        billDescription: params.billDescription.substring(0, 100), // Max 100 chars
        billPriceSetting: params.billPriceSetting,
        billPayorInfo: params.billPayorInfo,
        billAmount: params.billAmount.toString(),
        billReturnUrl: params.billReturnUrl,
        billCallbackUrl: params.billCallbackUrl,
        billExternalReferenceNo: params.billExternalReferenceNo,
        billTo: params.billTo.substring(0, 100),
        billEmail: params.billEmail,
        billPhone: params.billPhone || '0000000000',
        billContentEmail: params.billContentEmail || '',
        billPaymentChannel: params.billPaymentChannel || PAYMENT_CHANNELS.FPX,
        billChargeToCustomer: params.billChargeToCustomer || '1', // Charge FPX fee to customer
      })

      logger.debug('Calling ToyyibPay API', { url: apiUrl })
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      logger.debug('API response received', { status: response.status })

      // Get response as text first to handle non-JSON responses
      const responseText = await response.text()

      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch {
        // ToyyibPay sometimes returns text error messages like "[CATEGORY-NOT-FOUND]"
        logger.error('Non-JSON response from ToyyibPay', {
          responseText: responseText.substring(0, 200),
          status: response.status,
        })
        throw new ToyyibPayError(
          `ToyyibPay error: ${responseText.trim()}`,
          'API_ERROR',
          { responseText, status: response.status }
        )
      }

      logger.debug('API response parsed', { hasResult: !!result })

      // ToyyibPay returns an array with a single object containing BillCode
      if (Array.isArray(result) && result[0]?.BillCode) {
        const billCode = result[0].BillCode
        operation.success('Bill created', { billCode })
        return billCode
      }

      // Check for error response
      if (result.error || result.msg) {
        const errorMsg = result.msg || result.error || 'Failed to create bill'
        operation.failure(new Error(errorMsg), { code: 'BILL_CREATE_FAILED', result })
        throw new ToyyibPayError(errorMsg, 'BILL_CREATE_FAILED', result)
      }

      operation.failure(new Error('Unexpected response'), { code: 'UNEXPECTED_RESPONSE' })
      throw new ToyyibPayError('Unexpected response from ToyyibPay', 'UNEXPECTED_RESPONSE', result)
    } catch (error) {
      if (error instanceof ToyyibPayError) throw error
      operation.failure(error as Error, { code: 'CONNECTION_ERROR' })
      throw new ToyyibPayError(
        'Failed to connect to ToyyibPay',
        'CONNECTION_ERROR',
        error
      )
    }
  }

  /**
   * Get transactions for a bill
   * Used to verify payment status
   */
  static async getBillTransactions(billCode: string): Promise<BillTransaction[]> {
    if (!this.isConfigured()) {
      throw new ToyyibPayError('ToyyibPay is not configured', 'NOT_CONFIGURED')
    }

    try {
      const formData = new URLSearchParams({
        userSecretKey: TOYYIBPAY_SECRET_KEY,
        billCode: billCode,
      })

      const response = await fetch(`${TOYYIBPAY_URL}/index.php/api/getBillTransactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()

      if (Array.isArray(result)) {
        return result
      }

      return []
    } catch (error) {
      throw new ToyyibPayError(
        'Failed to get bill transactions',
        'TRANSACTION_FETCH_ERROR',
        error
      )
    }
  }

  /**
   * Parse webhook payload from ToyyibPay
   * Handles both JSON and form-urlencoded data
   */
  static parseWebhookPayload(
    contentType: string,
    data: Record<string, string>
  ): WebhookPayload {
    return {
      refno: data.refno || data.payment_reference || data.reference,
      status: data.status || data.payment_status,
      reason: data.reason,
      billcode: data.billcode || data.bill_code,
      order_id: data.order_id || data.billExternalReferenceNo,
      amount: data.amount,
      transaction_id: data.transaction_id || data.transactionId,
    }
  }

  /**
   * Map ToyyibPay status to internal status
   */
  static mapPaymentStatus(toyyibpayStatus: string): 'pending' | 'completed' | 'failed' {
    switch (toyyibpayStatus) {
      case TOYYIBPAY_STATUS.SUCCESS:
      case 'success':
      case 'paid':
      case '1':
        return 'completed'
      case TOYYIBPAY_STATUS.FAILED:
      case 'failed':
      case 'cancelled':
      case '3':
        return 'failed'
      default:
        return 'pending'
    }
  }

  /**
   * Get human-readable failure reason
   */
  static getFailureReason(reason: string | undefined): string {
    if (!reason) return 'Payment was not completed'

    const reasonMap: Record<string, string> = {
      'Cancelled': 'Payment was cancelled by user',
      'Transaction timeout': 'Payment session expired',
      'Insufficient funds': 'Insufficient funds in account',
      'Bank error': 'Bank processing error',
      'Invalid card': 'Invalid card details',
    }

    return reasonMap[reason] || reason
  }
}

export default ToyyibPayService
