// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ContactAddress {
  label: string           // e.g., "Registered Address" or "Operational Address"
  lines: string[]         // Array of address lines
  googleMapsUrl?: string
}

export interface ContactEmail {
  type: 'general' | 'donations' | 'support' | 'other'
  label: string           // e.g., "General Inquiries"
  address: string
}

export interface ContactPhone {
  type: 'main' | 'hotline' | 'whatsapp' | 'other'
  label: string           // e.g., "Main Office"
  number: string
}

export interface OfficeHours {
  weekdays: string        // e.g., "Monday - Friday"
  weekdayHours: string    // e.g., "9:00 AM - 5:00 PM"
  saturday?: string
  saturdayHours?: string
  sunday?: string
  sundayHours?: string
  note?: string           // e.g., "Closed on public holidays"
}

export interface ContactSettings {
  primaryAddress: ContactAddress
  secondaryAddress?: ContactAddress
  emails: ContactEmail[]
  phones: ContactPhone[]
  officeHours?: OfficeHours
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  primaryAddress: {
    label: 'Registered Address',
    lines: [
      'D-G-05 Jalan PKAK 2',
      'Pusat Komersil Ayer Keroh',
      '75450 Ayer Keroh',
      'Melaka, Malaysia',
    ],
  },
  emails: [
    { type: 'general', label: 'General Inquiries', address: 'admin@insanprihatin.org' },
  ],
  phones: [
    { type: 'main', label: 'Main Office', number: '+60 12-345 6789' },
  ],
  officeHours: {
    weekdays: 'Monday - Friday',
    weekdayHours: '9:00 AM - 5:00 PM',
    saturday: 'Saturday',
    saturdayHours: '9:00 AM - 1:00 PM',
  },
}
