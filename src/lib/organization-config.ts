/**
 * Organization Configuration
 *
 * Centralized configuration for organization details used across the application.
 * This fetches data from site_settings in the database, with fallback defaults.
 *
 * Used in:
 * - Donation receipts (PDF and email)
 * - Contact pages
 * - Footer
 * - Email templates
 */

import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'

// Default organization details (used as fallback if not configured in admin)
const DEFAULT_ORG_CONFIG: OrganizationConfig = {
  name: 'Yayasan Insan Prihatin',
  tagline: 'Empowering Communities, Transforming Lives',
  registrationNumber: 'PPAB-23/2025',
  taxExemptionRef: '', // Not yet tax deductible
  address: [
    'No. 1, Jalan Prihatin',
    'Taman Kasih Sayang',
    '50000 Kuala Lumpur',
    'Malaysia',
  ],
  phone: '+60 3-1234 5678',
  email: 'info@insanprihatin.org',
  website: 'www.insanprihatin.org',
  logoUrl: '/YIP-main-logo-transparent.png',
}

export interface OrganizationConfig {
  name: string
  tagline: string
  registrationNumber: string
  taxExemptionRef: string
  address: string[]
  phone: string
  email: string
  website: string
  logoUrl: string
}

/**
 * Get a site setting value by key
 */
async function getSettingValue(key: string): Promise<unknown> {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, key),
    })
    return setting?.value
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return null
  }
}

/**
 * Get organization configuration from database with fallback to defaults
 */
export async function getOrganizationConfig(): Promise<OrganizationConfig> {
  try {
    // Fetch all organization-related settings in parallel
    const [
      orgConfig,
      siteName,
      siteTagline,
      contactEmail,
      contactPhone,
      address,
    ] = await Promise.all([
      getSettingValue('organizationConfig'),
      getSettingValue('siteName'),
      getSettingValue('siteTagline'),
      getSettingValue('contactEmail'),
      getSettingValue('contactPhone'),
      getSettingValue('address'),
    ])

    // If we have a full org config object, use it
    if (orgConfig && typeof orgConfig === 'object') {
      const config = orgConfig as Partial<OrganizationConfig>
      return {
        name: config.name || (siteName as string) || DEFAULT_ORG_CONFIG.name,
        tagline: config.tagline || (siteTagline as string) || DEFAULT_ORG_CONFIG.tagline,
        registrationNumber: config.registrationNumber || DEFAULT_ORG_CONFIG.registrationNumber,
        taxExemptionRef: config.taxExemptionRef || DEFAULT_ORG_CONFIG.taxExemptionRef,
        address: config.address || parseAddress(address as string) || DEFAULT_ORG_CONFIG.address,
        phone: config.phone || (contactPhone as string) || DEFAULT_ORG_CONFIG.phone,
        email: config.email || (contactEmail as string) || DEFAULT_ORG_CONFIG.email,
        website: config.website || DEFAULT_ORG_CONFIG.website,
        logoUrl: config.logoUrl || DEFAULT_ORG_CONFIG.logoUrl,
      }
    }

    // Fall back to individual settings or defaults
    return {
      name: (siteName as string) || DEFAULT_ORG_CONFIG.name,
      tagline: (siteTagline as string) || DEFAULT_ORG_CONFIG.tagline,
      registrationNumber: DEFAULT_ORG_CONFIG.registrationNumber,
      taxExemptionRef: DEFAULT_ORG_CONFIG.taxExemptionRef,
      address: parseAddress(address as string) || DEFAULT_ORG_CONFIG.address,
      phone: (contactPhone as string) || DEFAULT_ORG_CONFIG.phone,
      email: (contactEmail as string) || DEFAULT_ORG_CONFIG.email,
      website: DEFAULT_ORG_CONFIG.website,
      logoUrl: DEFAULT_ORG_CONFIG.logoUrl,
    }
  } catch (error) {
    console.error('Failed to get organization config:', error)
    return DEFAULT_ORG_CONFIG
  }
}

/**
 * Parse address string into array format
 */
function parseAddress(address: string | null | undefined): string[] | null {
  if (!address) return null

  // If it's already in proper format (newline separated), split by newlines
  if (address.includes('\n')) {
    return address.split('\n').map(line => line.trim()).filter(Boolean)
  }

  // Otherwise return as single-line array
  return [address]
}

/**
 * Get the default organization config (for client-side usage or initial values)
 */
export function getDefaultOrganizationConfig(): OrganizationConfig {
  return { ...DEFAULT_ORG_CONFIG }
}

/**
 * Format address array as a single string
 */
export function formatAddress(address: string[]): string {
  return address.join('\n')
}

/**
 * Format address array as HTML (for emails)
 */
export function formatAddressHtml(address: string[]): string {
  return address.join('<br>')
}
