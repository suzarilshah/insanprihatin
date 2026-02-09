/**
 * Receipt Service
 *
 * Handles receipt number generation and receipt data management
 * for donations to Yayasan Insan Prihatin.
 */

import { db, donations, projects } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { getOrganizationConfig, type OrganizationConfig } from './organization-config'
import { getLocalizedValue, type LocalizedString } from '@/i18n/config'

export interface ReceiptData {
  receiptNumber: string
  donorName: string
  donorEmail: string
  donorPhone?: string
  amount: number
  currency: string
  projectTitle?: string
  paymentReference: string
  paymentMethod: string
  transactionId?: string
  completedAt: Date
  createdAt: Date
  message?: string
  // Organization details (fetched from config)
  organization?: OrganizationConfig
}

/**
 * Generate a unique receipt number in format: YIP-YYYY-NNNNNN
 * Example: YIP-2026-000001
 */
export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `YIP-${year}-`

  // Get the last receipt number for this year
  const lastReceipt = await db.query.donations.findFirst({
    where: sql`${donations.receiptNumber} LIKE ${prefix + '%'}`,
    orderBy: sql`${donations.receiptNumber} DESC`,
    columns: {
      receiptNumber: true,
    },
  })

  let sequence = 1

  if (lastReceipt?.receiptNumber) {
    // Extract sequence number from last receipt
    const lastSequence = lastReceipt.receiptNumber.split('-')[2]
    if (lastSequence) {
      sequence = parseInt(lastSequence, 10) + 1
    }
  }

  // Format sequence with leading zeros (6 digits)
  const sequenceStr = sequence.toString().padStart(6, '0')

  return `${prefix}${sequenceStr}`
}

/**
 * Get receipt data for a donation (includes organization config)
 */
export async function getReceiptData(paymentReference: string): Promise<ReceiptData | null> {
  const donation = await db.query.donations.findFirst({
    where: eq(donations.paymentReference, paymentReference),
  })

  if (!donation || donation.paymentStatus !== 'completed') {
    return null
  }

  // Get project title if applicable
  let projectTitle: string | undefined
  if (donation.projectId) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, donation.projectId),
      columns: { title: true },
    })
    // Extract string from LocalizedString (default to English)
    if (project?.title) {
      projectTitle = getLocalizedValue(project.title as LocalizedString, 'en')
    }
  }

  // Get organization config from database
  const organization = await getOrganizationConfig()

  // Note: Amount is stored in cents, convert to currency units
  return {
    receiptNumber: donation.receiptNumber || 'Pending',
    donorName: donation.donorName || 'Anonymous',
    donorEmail: donation.donorEmail || '',
    donorPhone: donation.donorPhone || undefined,
    amount: donation.amount / 100, // Convert cents to currency units
    currency: donation.currency || 'MYR',
    projectTitle,
    paymentReference: donation.paymentReference || paymentReference,
    paymentMethod: donation.paymentMethod || 'FPX',
    transactionId: donation.toyyibpayTransactionId || undefined,
    completedAt: donation.completedAt || donation.createdAt,
    createdAt: donation.createdAt,
    message: donation.message || undefined,
    organization,
  }
}

/**
 * Organization details for receipt (deprecated - use getOrganizationConfig instead)
 * Kept for backwards compatibility - updated with official address from Trust Deed
 */
export const organizationDetails = {
  name: 'Yayasan Insan Prihatin',
  legalName: 'Pemegang Amanah Yayasan Insan Prihatin',
  tagline: 'Ihsan untuk Insan',
  slogan: 'Ini Rumah Kita',
  fullSlogan: 'Ihsan untuk Insan: Menghilangkan Kelaparan, Kejahilan dan Kedukaan',
  registrationNumber: 'PPAB-23/2025',
  taxExemptionRef: '', // Not yet tax deductible
  address: [
    'D-G-05 Jalan PKAK 2',
    'Pusat Komersil Ayer Keroh',
    '75450 Ayer Keroh',
    'Melaka, Malaysia',
  ],
  phone: '+60 12-345 6789',
  email: 'admin@insanprihatin.org',
  website: 'www.insanprihatin.org',
  logoUrl: '/images/logo-light.png',
}

/**
 * Format amount with currency
 */
export function formatAmount(amount: number, currency: string = 'MYR'): string {
  const formatter = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  })
  return formatter.format(amount)
}

/**
 * Format date for receipt
 */
export function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
