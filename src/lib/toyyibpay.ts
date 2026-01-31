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

// ToyyibPay Configuration
const TOYYIBPAY_URL = process.env.TOYYIBPAY_URL || 'https://dev.toyyibpay.com'
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY || ''

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
    if (!this.isConfigured()) {
      throw new ToyyibPayError('ToyyibPay is not configured', 'NOT_CONFIGURED')
    }

    try {
      const formData = new URLSearchParams({
        userSecretKey: TOYYIBPAY_SECRET_KEY,
        catname: params.catname,
        catdescription: params.catdescription,
      })

      const response = await fetch(`${TOYYIBPAY_URL}/index.php/api/createCategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()

      // ToyyibPay returns an array with a single object
      if (Array.isArray(result) && result[0]?.CategoryCode) {
        return result[0].CategoryCode
      }

      // Check for error response
      if (result.error || result.msg) {
        throw new ToyyibPayError(
          result.msg || result.error || 'Failed to create category',
          'CATEGORY_CREATE_FAILED',
          result
        )
      }

      throw new ToyyibPayError('Unexpected response from ToyyibPay', 'UNEXPECTED_RESPONSE', result)
    } catch (error) {
      if (error instanceof ToyyibPayError) throw error
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
    const SETTING_KEY = 'toyyibpay_general_fund_category'

    // Check if we already have a General Fund category
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, SETTING_KEY),
    })

    if (existing?.value) {
      const categoryCode = (existing.value as { code: string })?.code
      if (categoryCode) {
        return categoryCode
      }
    }

    // Create new General Fund category
    const categoryCode = await this.createCategory({
      catname: 'General Fund',
      catdescription: 'General donations to Yayasan Insan Prihatin',
    })

    // Store the category code
    await db.insert(siteSettings).values({
      key: SETTING_KEY,
      value: { code: categoryCode, createdAt: new Date().toISOString() },
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: { code: categoryCode, createdAt: new Date().toISOString() },
        updatedAt: new Date(),
      },
    })

    return categoryCode
  }

  /**
   * Create a new bill in ToyyibPay
   * Bills are invoices that customers pay
   */
  static async createBill(params: CreateBillParams): Promise<string> {
    if (!this.isConfigured()) {
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

      const response = await fetch(`${TOYYIBPAY_URL}/index.php/api/createBill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()

      // ToyyibPay returns an array with a single object containing BillCode
      if (Array.isArray(result) && result[0]?.BillCode) {
        return result[0].BillCode
      }

      // Check for error response
      if (result.error || result.msg) {
        throw new ToyyibPayError(
          result.msg || result.error || 'Failed to create bill',
          'BILL_CREATE_FAILED',
          result
        )
      }

      throw new ToyyibPayError('Unexpected response from ToyyibPay', 'UNEXPECTED_RESPONSE', result)
    } catch (error) {
      if (error instanceof ToyyibPayError) throw error
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
