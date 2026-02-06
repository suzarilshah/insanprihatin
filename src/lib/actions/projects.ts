'use server'

import { revalidatePath } from 'next/cache'
import { db, projects } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyProjectPublished } from '@/lib/actions/notifications'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'
import { autoTranslateFields } from '@/lib/auto-translate'

type LocalizedField = LocalizedString | string

// Helper to get string value from LocalizedString (for logging/API calls)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

// Helper to convert string to LocalizedString (for database insertion)
const toLocalized = (value: LocalizedField | null | undefined): LocalizedString | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return { en: value, ms: value }
  return value
}

// Helper for required LocalizedString fields
const toLocalizedRequired = (value: LocalizedField): LocalizedString => {
  if (typeof value === 'string') return { en: value, ms: value }
  return value
}

export async function getProjects(options?: {
  published?: boolean
  category?: string
  status?: string
  limit?: number
  donationEnabled?: boolean
}) {
  const conditions = []

  if (options?.published !== undefined) {
    conditions.push(eq(projects.isPublished, options.published))
  }

  if (options?.category) {
    conditions.push(eq(projects.category, options.category))
  }

  if (options?.status) {
    conditions.push(eq(projects.status, options.status))
  }

  if (options?.donationEnabled !== undefined) {
    conditions.push(eq(projects.donationEnabled, options.donationEnabled))
  }

  const projectsList = await db.query.projects.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(projects.createdAt)],
    limit: options?.limit,
  })

  return projectsList
}

export async function getProject(slug: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
  })
  return project
}

export async function createProject(data: {
  slug: string
  title: LocalizedField
  subtitle?: LocalizedField
  description: LocalizedField
  content?: LocalizedField
  featuredImage?: string
  gallery?: string[]
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
  budget?: string
  beneficiaries?: number
  location?: string
  metaTitle?: LocalizedField
  metaDescription?: LocalizedField
  isPublished?: boolean
  // Donation fields
  donationEnabled?: boolean
  donationGoal?: number
}) {
  const user = await requireAuth()

  // If donation is enabled, create ToyyibPay category
  let toyyibpayCategoryCode: string | undefined
  const titleStr = l(data.title)
  if (data.donationEnabled && ToyyibPayService.isConfigured()) {
    try {
      toyyibpayCategoryCode = await ToyyibPayService.createCategory({
        catname: titleStr.substring(0, 30), // Max 30 chars
        catdescription: `Donations for ${titleStr}`.substring(0, 100), // Max 100 chars
      })
      console.log(`Created ToyyibPay category for project: ${toyyibpayCategoryCode}`)
    } catch (error) {
      console.error('Failed to create ToyyibPay category:', error)
      // Don't fail the project creation, just log the error
      // Category can be created later when updating
    }
  }

  // Auto-translate any fields that are missing one language
  console.log('[Project] Auto-translating content...')
  const translated = await autoTranslateFields({
    title: toLocalizedRequired(data.title),
    subtitle: toLocalized(data.subtitle),
    description: toLocalizedRequired(data.description),
    content: toLocalized(data.content),
    metaTitle: toLocalized(data.metaTitle),
    metaDescription: toLocalized(data.metaDescription),
  })
  console.log('[Project] Auto-translation complete')

  const project = await db.insert(projects).values({
    slug: data.slug,
    title: translated.title || toLocalizedRequired(data.title),
    subtitle: translated.subtitle,
    description: translated.description || toLocalizedRequired(data.description),
    content: translated.content,
    featuredImage: data.featuredImage,
    gallery: data.gallery,
    category: data.category,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    budget: data.budget,
    beneficiaries: data.beneficiaries,
    location: data.location,
    metaTitle: translated.metaTitle,
    metaDescription: translated.metaDescription,
    isPublished: data.isPublished,
    donationEnabled: data.donationEnabled,
    donationGoal: data.donationGoal,
    donationRaised: 0,
    toyyibpayCategoryCode,
  }).returning()

  // Create version record
  await createVersion(
    'projects',
    project[0].id,
    project[0] as Record<string, unknown>,
    'create',
    { id: user.id, email: user.email, name: user.name }
  )

  // Log activity
  await logActivity('content_create', `Created project: ${titleStr}`, {
    contentType: 'projects',
    contentId: project[0].id,
    contentTitle: titleStr,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (data.isPublished) {
    await notifyProjectPublished({
      projectId: project[0].id,
      title: titleStr,
      authorName: user.name,
    })
  }

  revalidatePath('/projects')
  revalidatePath('/donate')
  return { success: true, project: project[0] }
}

export async function updateProject(id: string, data: {
  slug?: string
  title?: LocalizedField
  subtitle?: LocalizedField
  description?: LocalizedField
  content?: LocalizedField
  featuredImage?: string
  gallery?: string[]
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
  budget?: string
  beneficiaries?: number
  location?: string
  metaTitle?: LocalizedField
  metaDescription?: LocalizedField
  isPublished?: boolean
  // Donation fields
  donationEnabled?: boolean
  donationGoal?: number
}) {
  const user = await requireAuth()

  // Get existing data for version comparison
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Project not found' }
  }

  // Determine change type
  let changeType: 'update' | 'publish' | 'unpublish' = 'update'
  if (data.isPublished !== undefined && data.isPublished !== existing.isPublished) {
    changeType = data.isPublished ? 'publish' : 'unpublish'
  }

  // If donation is being enabled and no category exists, create one
  let toyyibpayCategoryCode = existing.toyyibpayCategoryCode
  if (
    data.donationEnabled &&
    !existing.toyyibpayCategoryCode &&
    ToyyibPayService.isConfigured()
  ) {
    try {
      const projectTitle = l(data.title) || l(existing.title)
      toyyibpayCategoryCode = await ToyyibPayService.createCategory({
        catname: projectTitle.substring(0, 30),
        catdescription: `Donations for ${projectTitle}`.substring(0, 100),
      })
      console.log(`Created ToyyibPay category for project ${id}: ${toyyibpayCategoryCode}`)
    } catch (error) {
      console.error('Failed to create ToyyibPay category:', error)
      // Don't fail the update, just log the error
    }
  }

  // Auto-translate any fields that are missing one language
  const fieldsToTranslate: Record<string, LocalizedString | string | null | undefined> = {}
  if (data.title !== undefined) fieldsToTranslate.title = toLocalizedRequired(data.title)
  if (data.subtitle !== undefined) fieldsToTranslate.subtitle = toLocalized(data.subtitle)
  if (data.description !== undefined) fieldsToTranslate.description = toLocalizedRequired(data.description)
  if (data.content !== undefined) fieldsToTranslate.content = toLocalized(data.content)
  if (data.metaTitle !== undefined) fieldsToTranslate.metaTitle = toLocalized(data.metaTitle)
  if (data.metaDescription !== undefined) fieldsToTranslate.metaDescription = toLocalized(data.metaDescription)

  let translated: Record<string, LocalizedString | undefined> = {}
  if (Object.keys(fieldsToTranslate).length > 0) {
    console.log('[Project] Auto-translating updated content...')
    translated = await autoTranslateFields(fieldsToTranslate)
    console.log('[Project] Auto-translation complete')
  }

  // Prepare update data with LocalizedString conversion
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.title !== undefined && { title: translated.title || toLocalizedRequired(data.title) }),
    ...(data.subtitle !== undefined && { subtitle: translated.subtitle }),
    ...(data.description !== undefined && { description: translated.description || toLocalizedRequired(data.description) }),
    ...(data.content !== undefined && { content: translated.content }),
    ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
    ...(data.gallery !== undefined && { gallery: data.gallery }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.startDate !== undefined && { startDate: data.startDate }),
    ...(data.endDate !== undefined && { endDate: data.endDate }),
    ...(data.budget !== undefined && { budget: data.budget }),
    ...(data.beneficiaries !== undefined && { beneficiaries: data.beneficiaries }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.metaTitle !== undefined && { metaTitle: translated.metaTitle }),
    ...(data.metaDescription !== undefined && { metaDescription: translated.metaDescription }),
    ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    ...(data.donationEnabled !== undefined && { donationEnabled: data.donationEnabled }),
    ...(data.donationGoal !== undefined && { donationGoal: data.donationGoal }),
  }

  // Only update category code if we created a new one
  if (toyyibpayCategoryCode && toyyibpayCategoryCode !== existing.toyyibpayCategoryCode) {
    updateData.toyyibpayCategoryCode = toyyibpayCategoryCode
  }

  await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))

  // Get updated data
  const updated = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  })

  // Create version record
  await createVersion(
    'projects',
    id,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> }
  )

  // Log activity
  const actionText = changeType === 'publish' ? 'Published' : changeType === 'unpublish' ? 'Unpublished' : 'Updated'
  await logActivity(`content_${changeType}`, `${actionText} project: ${l(existing.title)}`, {
    contentType: 'projects',
    contentId: id,
    contentTitle: l(existing.title),
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (changeType === 'publish') {
    await notifyProjectPublished({
      projectId: id,
      title: l(data.title) || l(existing.title),
      authorName: user.name,
    })
  }

  revalidatePath('/projects')
  revalidatePath('/donate')
  if (data.slug) {
    revalidatePath(`/projects/${data.slug}`)
  }

  return { success: true }
}

export async function deleteProject(id: string) {
  const user = await requireAuth()

  // Get existing data before deletion
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Project not found' }
  }

  // Create version record BEFORE deletion
  await createVersion(
    'projects',
    id,
    existing as Record<string, unknown>,
    'delete',
    { id: user.id, email: user.email, name: user.name },
    { customSummary: `Deleted project: ${l(existing.title)}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted project: ${l(existing.title)}`, {
    contentType: 'projects',
    contentId: id,
    contentTitle: l(existing.title),
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(projects).where(eq(projects.id, id))

  revalidatePath('/projects')
  return { success: true }
}
