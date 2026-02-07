'use server'

import { revalidatePath } from 'next/cache'
import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { logActivity } from '@/lib/versioning'
import { type StockPhotoSettings, DEFAULT_STOCK_PHOTOS } from '@/lib/stock-photo-config'

const SETTINGS_KEY = 'stockPhotos'

// Get current stock photo settings
export async function getStockPhotoSettings(): Promise<StockPhotoSettings> {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, SETTINGS_KEY),
  })

  if (!setting?.value) return DEFAULT_STOCK_PHOTOS

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
