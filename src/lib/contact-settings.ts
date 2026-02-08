'use server'

import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'
import {
  type ContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from './contact-settings-types'

// Note: Types and DEFAULT_CONTACT_SETTINGS are exported from contact-settings-types.ts
// Import from there for use in client components

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get contact settings from database with fallback to legacy settings and defaults
 */
export async function getContactSettings(): Promise<ContactSettings> {
  try {
    // First, try to get the new contactSettings
    const contactSettingsResult = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'contactSettings'),
    })

    if (contactSettingsResult?.value) {
      // Merge with defaults to ensure all required fields exist
      return {
        ...DEFAULT_CONTACT_SETTINGS,
        ...(contactSettingsResult.value as Partial<ContactSettings>),
      }
    }

    // Fall back to legacy settings
    const [addressResult, emailResult, phoneResult] = await Promise.all([
      db.query.siteSettings.findFirst({ where: eq(siteSettings.key, 'address') }),
      db.query.siteSettings.findFirst({ where: eq(siteSettings.key, 'contactEmail') }),
      db.query.siteSettings.findFirst({ where: eq(siteSettings.key, 'contactPhone') }),
    ])

    // Build settings from legacy values
    const legacySettings: ContactSettings = { ...DEFAULT_CONTACT_SETTINGS }

    if (addressResult?.value && typeof addressResult.value === 'string') {
      legacySettings.primaryAddress = {
        label: 'Registered Address',
        lines: addressResult.value.split('\n').map(line => line.trim()).filter(Boolean),
      }
    }

    if (emailResult?.value && typeof emailResult.value === 'string') {
      legacySettings.emails = [
        { type: 'general', label: 'General Inquiries', address: emailResult.value },
      ]
    }

    if (phoneResult?.value && typeof phoneResult.value === 'string') {
      legacySettings.phones = [
        { type: 'main', label: 'Main Office', number: phoneResult.value },
      ]
    }

    return legacySettings
  } catch (error) {
    console.error('Failed to get contact settings:', error)
    return DEFAULT_CONTACT_SETTINGS
  }
}

/**
 * Update contact settings in the database
 */
export async function updateContactSettings(
  settings: Partial<ContactSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'contactSettings'),
    })

    const currentSettings = await getContactSettings()
    const newSettings = { ...currentSettings, ...settings }

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          value: newSettings,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing.id))
    } else {
      await db.insert(siteSettings).values({
        key: 'contactSettings',
        value: newSettings,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update contact settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}
