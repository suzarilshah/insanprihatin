'use server'

import { revalidatePath } from 'next/cache'
import { db, heroContent, aboutContent, impactStats, siteSettings, faqs, pages } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'

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
  await requireAuth()

  const existing = await db.query.heroContent.findFirst({
    where: eq(heroContent.isActive, true),
  })

  if (existing) {
    await db
      .update(heroContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(heroContent.id, existing.id))
  } else {
    await db.insert(heroContent).values({
      ...data,
      isActive: true,
    })
  }

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
  await requireAuth()

  const existing = await db.query.aboutContent.findFirst()

  if (existing) {
    await db
      .update(aboutContent)
      .set({
        ...data,
        values: data.values,
        updatedAt: new Date(),
      })
      .where(eq(aboutContent.id, existing.id))
  } else {
    await db.insert(aboutContent).values({
      ...data,
      values: data.values,
    })
  }

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
  await requireAuth()

  await db.insert(impactStats).values({
    ...data,
    isActive: true,
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
  await requireAuth()

  await db
    .update(impactStats)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(impactStats.id, id))

  revalidatePath('/')
  return { success: true }
}

export async function deleteImpactStat(id: string) {
  await requireAuth()

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
  await requireAuth()

  await db.insert(faqs).values({
    ...data,
    isActive: true,
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
  await requireAuth()

  await db.update(faqs).set(data).where(eq(faqs.id, id))

  revalidatePath('/contact')
  return { success: true }
}

export async function deleteFAQ(id: string) {
  await requireAuth()

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
  await requireAuth()

  const existing = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  })

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing.id))
  } else {
    await db.insert(siteSettings).values({ key, value })
  }

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
  await requireAuth()

  const existing = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  })

  if (existing) {
    await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, existing.id))
  } else {
    await db.insert(pages).values({
      slug,
      title: data.title || slug,
      ...data,
    })
  }

  revalidatePath(`/${slug}`)
  return { success: true }
}
