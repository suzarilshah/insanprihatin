/**
 * Organization Configuration - Client Safe
 *
 * This file contains only the client-safe parts of organization configuration:
 * - Type definitions
 * - Default values
 * - Helper functions that don't require database access
 *
 * For server-side functions that fetch from the database, use organization-config.ts
 */

// Default organization details (official information from Trust Deed / Surat Ikatan Amanah)
export const DEFAULT_ORG_CONFIG: OrganizationConfig = {
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
  email: 'info@insanprihatin.org',
  website: 'www.insanprihatin.org',
  logoUrl: '/images/logo-light.png',
  // Three main objectives from Trust Deed
  objectives: {
    en: [
      {
        title: 'Education',
        malay: 'Pendidikan',
        description: 'Providing educational support and opportunities for underprivileged students to ensure equal access to quality education.',
        icon: 'education',
      },
      {
        title: 'Social',
        malay: 'Sosial',
        description: 'Addressing social welfare needs and building stronger community bonds through outreach programs.',
        icon: 'social',
      },
      {
        title: 'Welfare',
        malay: 'Kebajikan',
        description: 'Delivering essential welfare services to those in need, including food aid, healthcare support, and emergency assistance.',
        icon: 'welfare',
      },
    ],
    ms: [
      {
        title: 'Pendidikan',
        malay: 'Pendidikan',
        description: 'Menyediakan sokongan pendidikan dan peluang untuk pelajar kurang bernasib baik bagi memastikan akses sama rata kepada pendidikan berkualiti.',
        icon: 'education',
      },
      {
        title: 'Sosial',
        malay: 'Sosial',
        description: 'Menangani keperluan kebajikan sosial dan membina ikatan komuniti yang lebih kukuh melalui program jangkauan.',
        icon: 'social',
      },
      {
        title: 'Kebajikan',
        malay: 'Kebajikan',
        description: 'Menyampaikan perkhidmatan kebajikan penting kepada mereka yang memerlukan, termasuk bantuan makanan, sokongan kesihatan, dan bantuan kecemasan.',
        icon: 'welfare',
      },
    ],
  },
}

export interface OrganizationObjective {
  title: string
  malay: string
  description: string
  icon: 'education' | 'social' | 'welfare'
}

export interface OrganizationConfig {
  name: string
  legalName?: string
  tagline: string
  slogan?: string
  fullSlogan?: string
  registrationNumber: string
  taxExemptionRef: string
  address: string[]
  phone: string
  email: string
  website: string
  logoUrl: string
  objectives?: {
    en: OrganizationObjective[]
    ms: OrganizationObjective[]
  }
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
