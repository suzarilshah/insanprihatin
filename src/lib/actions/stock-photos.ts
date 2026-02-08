'use server'

import { revalidatePath } from 'next/cache'
import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { logActivity } from '@/lib/versioning'
import {
  type StockPhotoSettings,
  DEFAULT_STOCK_PHOTOS,
  isLegacySettings,
  migrateLegacySettings,
} from '@/lib/stock-photo-config'

const SETTINGS_KEY = 'stockPhotos'

// Get current stock photo settings
export async function getStockPhotoSettings(): Promise<StockPhotoSettings> {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, SETTINGS_KEY),
  })

  if (!setting?.value) return DEFAULT_STOCK_PHOTOS

  // Check if the stored settings are in legacy format (just URLs)
  if (isLegacySettings(setting.value)) {
    // Migrate legacy settings to new format with attribution
    return migrateLegacySettings(setting.value)
  }

  // Merge with defaults to ensure all fields exist
  return { ...DEFAULT_STOCK_PHOTOS, ...(setting.value as Partial<StockPhotoSettings>) }
}

// Update stock photo settings
export async function updateStockPhotoSettings(
  data: Partial<StockPhotoSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth()

    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, SETTINGS_KEY),
    })

    const currentSettings = await getStockPhotoSettings()
    const newSettings = { ...currentSettings, ...data }

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
        key: SETTINGS_KEY,
        value: newSettings,
      })
    }

    // Log activity
    await logActivity('settings_update', 'Updated stock photo settings', {
      contentType: 'site_settings',
      contentTitle: 'Stock Photos',
      user: { id: user.id, email: user.email, name: user.name },
      metadata: { changedFields: Object.keys(data) },
    })

    // Revalidate pages that use stock photos
    revalidatePath('/')
    revalidatePath('/about')

    return { success: true }
  } catch (error) {
    console.error('Failed to update stock photo settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}

// Migrate existing settings to new format (one-time operation)
export async function migrateStockPhotoSettings(): Promise<{ success: boolean; migrated: boolean; error?: string }> {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, SETTINGS_KEY),
    })

    if (!setting?.value) {
      return { success: true, migrated: false }
    }

    // Check if already in new format
    if (!isLegacySettings(setting.value)) {
      return { success: true, migrated: false }
    }

    // Migrate to new format
    const migratedSettings = migrateLegacySettings(setting.value)

    await db
      .update(siteSettings)
      .set({
        value: migratedSettings,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, setting.id))

    return { success: true, migrated: true }
  } catch (error) {
    console.error('Failed to migrate stock photo settings:', error)
    return { success: false, migrated: false, error: 'Migration failed' }
  }
}
