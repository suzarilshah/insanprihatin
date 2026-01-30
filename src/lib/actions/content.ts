'use server'

import { revalidatePath } from 'next/cache'
import { db, heroContent, aboutContent, impactStats, siteSettings, faqs, pages } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'

// Hero Content Actions
export async function getHeroContent() {
  const hero = await db.query.heroContent.findFirst({
    where: eq(heroContent.isActive, true),
  })
  return hero
}

export async function updateHeroContent(data: {
  title: string
  subtitle: string
  description?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
}) {
  const user = await requireAuth()

  const existing = await db.query.heroContent.findFirst({
    where: eq(heroContent.isActive, true),
  })

  let contentId: string
  const changeType = existing ? 'update' : 'create'

  if (existing) {
    await db
      .update(heroContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(heroContent.id, existing.id))
    contentId = existing.id
  } else {
    const [newContent] = await db.insert(heroContent).values({
      ...data,
      isActive: true,
    }).returning()
    contentId = newContent.id
  }

  // Get updated content
  const updated = await db.query.heroContent.findFirst({
    where: eq(heroContent.id, contentId),
  })

  // Create version record
  await createVersion(
    'hero_content',
    contentId,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> | null }
  )

  // Log activity
  await logActivity(`content_${changeType}`, `${changeType === 'create' ? 'Created' : 'Updated'} hero content`, {
    contentType: 'hero_content',
    contentId,
    contentTitle: data.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/')
  return { success: true }
}

// About Content Actions
export async function getAboutContent() {
  const about = await db.query.aboutContent.findFirst()
  return about
}

export async function updateAboutContent(data: {
  title: string
  content: string
  mission?: string
  vision?: string
  values?: string[]
  image?: string
}) {
  const user = await requireAuth()

  const existing = await db.query.aboutContent.findFirst()
  let contentId: string
  const changeType = existing ? 'update' : 'create'

  if (existing) {
    await db
      .update(aboutContent)
      .set({
        ...data,
        values: data.values,
        updatedAt: new Date(),
      })
      .where(eq(aboutContent.id, existing.id))
    contentId = existing.id
  } else {
    const [newContent] = await db.insert(aboutContent).values({
      ...data,
      values: data.values,
    }).returning()
    contentId = newContent.id
  }

  // Get updated content
  const updated = await db.query.aboutContent.findFirst({
    where: eq(aboutContent.id, contentId),
  })

  // Create version record
  await createVersion(
    'about_content',
    contentId,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> | null }
  )

  // Log activity
  await logActivity(`content_${changeType}`, `${changeType === 'create' ? 'Created' : 'Updated'} about content`, {
    contentType: 'about_content',
    contentId,
    contentTitle: data.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/about')
  return { success: true }
}

// Impact Stats Actions
export async function getImpactStats() {
  const stats = await db.query.impactStats.findMany({
    where: eq(impactStats.isActive, true),
    orderBy: (stats, { asc }) => [asc(stats.sortOrder)],
  })
  return stats
}

export async function createImpactStat(data: {
  label: string
  value: string
  suffix?: string
  icon?: string
  sortOrder?: number
}) {
  const user = await requireAuth()

  const [stat] = await db.insert(impactStats).values({
    ...data,
    isActive: true,
  }).returning()

  // Create version record
  await createVersion(
    'impact_stats',
    stat.id,
    stat as Record<string, unknown>,
    'create',
    { id: user.id, email: user.email, name: user.name }
  )

  // Log activity
  await logActivity('content_create', `Created impact stat: ${data.label}`, {
    contentType: 'impact_stats',
    contentId: stat.id,
    contentTitle: data.label,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/')
  return { success: true }
}

export async function updateImpactStat(id: string, data: {
  label?: string
  value?: string
  suffix?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}) {
  const user = await requireAuth()

  // Get existing data
  const existing = await db.query.impactStats.findFirst({
    where: eq(impactStats.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Impact stat not found' }
  }

  await db
    .update(impactStats)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(impactStats.id, id))

  // Get updated data
  const updated = await db.query.impactStats.findFirst({
    where: eq(impactStats.id, id),
  })

  // Create version record
  await createVersion(
    'impact_stats',
    id,
    updated as Record<string, unknown>,
    'update',
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> }
  )

  // Log activity
  await logActivity('content_update', `Updated impact stat: ${existing.label}`, {
    contentType: 'impact_stats',
    contentId: id,
    contentTitle: existing.label,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/')
  return { success: true }
}

export async function deleteImpactStat(id: string) {
  const user = await requireAuth()

  // Get existing data before deletion
  const existing = await db.query.impactStats.findFirst({
    where: eq(impactStats.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Impact stat not found' }
  }

  // Create version record BEFORE deletion
  await createVersion(
    'impact_stats',
    id,
    existing as Record<string, unknown>,
    'delete',
    { id: user.id, email: user.email, name: user.name },
    { customSummary: `Deleted impact stat: ${existing.label}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted impact stat: ${existing.label}`, {
    contentType: 'impact_stats',
    contentId: id,
    contentTitle: existing.label,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(impactStats).where(eq(impactStats.id, id))

  revalidatePath('/')
  return { success: true }
}

// FAQ Actions
export async function getFAQs() {
  const faqList = await db.query.faqs.findMany({
    where: eq(faqs.isActive, true),
    orderBy: (faqs, { asc }) => [asc(faqs.sortOrder)],
  })
  return faqList
}

export async function createFAQ(data: {
  question: string
  answer: string
  category?: string
  sortOrder?: number
}) {
  const user = await requireAuth()

  const [faq] = await db.insert(faqs).values({
    ...data,
    isActive: true,
  }).returning()

  // Create version record
  await createVersion(
    'faqs',
    faq.id,
    faq as Record<string, unknown>,
    'create',
    { id: user.id, email: user.email, name: user.name }
  )

  // Log activity
  await logActivity('content_create', `Created FAQ: ${data.question.substring(0, 50)}...`, {
    contentType: 'faqs',
    contentId: faq.id,
    contentTitle: data.question,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/contact')
  return { success: true }
}

export async function updateFAQ(id: string, data: {
  question?: string
  answer?: string
  category?: string
  sortOrder?: number
  isActive?: boolean
}) {
  const user = await requireAuth()

  // Get existing data
  const existing = await db.query.faqs.findFirst({
    where: eq(faqs.id, id),
  })

  if (!existing) {
    return { success: false, error: 'FAQ not found' }
  }

  await db.update(faqs).set(data).where(eq(faqs.id, id))

  // Get updated data
  const updated = await db.query.faqs.findFirst({
    where: eq(faqs.id, id),
  })

  // Create version record
  await createVersion(
    'faqs',
    id,
    updated as Record<string, unknown>,
    'update',
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> }
  )

  // Log activity
  await logActivity('content_update', `Updated FAQ: ${existing.question.substring(0, 50)}...`, {
    contentType: 'faqs',
    contentId: id,
    contentTitle: existing.question,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath('/contact')
  return { success: true }
}

export async function deleteFAQ(id: string) {
  const user = await requireAuth()

  // Get existing data before deletion
  const existing = await db.query.faqs.findFirst({
    where: eq(faqs.id, id),
  })

  if (!existing) {
    return { success: false, error: 'FAQ not found' }
  }

  // Create version record BEFORE deletion
  await createVersion(
    'faqs',
    id,
    existing as Record<string, unknown>,
    'delete',
    { id: user.id, email: user.email, name: user.name },
    { customSummary: `Deleted FAQ: ${existing.question.substring(0, 50)}...` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted FAQ: ${existing.question.substring(0, 50)}...`, {
    contentType: 'faqs',
    contentId: id,
    contentTitle: existing.question,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(faqs).where(eq(faqs.id, id))

  revalidatePath('/contact')
  return { success: true }
}

// Site Settings Actions
export async function getSiteSetting(key: string) {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  })
  return setting?.value
}

export async function updateSiteSetting(key: string, value: unknown) {
  const user = await requireAuth()

  const existing = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  })

  let contentId: string
  const changeType = existing ? 'update' : 'create'

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing.id))
    contentId = existing.id
  } else {
    const [newSetting] = await db.insert(siteSettings).values({ key, value }).returning()
    contentId = newSetting.id
  }

  // Get updated setting
  const updated = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, contentId),
  })

  // Create version record
  await createVersion(
    'site_settings',
    contentId,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> | null }
  )

  // Log activity
  await logActivity(`settings_${changeType}`, `${changeType === 'create' ? 'Created' : 'Updated'} site setting: ${key}`, {
    contentType: 'site_settings',
    contentId,
    contentTitle: key,
    user: { id: user.id, email: user.email, name: user.name },
  })

  return { success: true }
}

// Page SEO Actions
export async function getPageSEO(slug: string) {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  })
  return page
}

export async function updatePageSEO(slug: string, data: {
  title?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
}) {
  const user = await requireAuth()

  const existing = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  })

  let contentId: string
  const changeType = existing ? 'update' : 'create'

  if (existing) {
    await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, existing.id))
    contentId = existing.id
  } else {
    const [newPage] = await db.insert(pages).values({
      slug,
      title: data.title || slug,
      ...data,
    }).returning()
    contentId = newPage.id
  }

  // Get updated page
  const updated = await db.query.pages.findFirst({
    where: eq(pages.id, contentId),
  })

  // Create version record
  await createVersion(
    'pages',
    contentId,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> | null }
  )

  // Log activity
  await logActivity(`content_${changeType}`, `${changeType === 'create' ? 'Created' : 'Updated'} page SEO: ${slug}`, {
    contentType: 'pages',
    contentId,
    contentTitle: data.title || slug,
    user: { id: user.id, email: user.email, name: user.name },
  })

  revalidatePath(`/${slug}`)
  return { success: true }
}
