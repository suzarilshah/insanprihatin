'use server'

import { revalidatePath } from 'next/cache'
import { db, projects } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyProjectPublished } from '@/lib/actions/notifications'
import { ToyyibPayService, ToyyibPayError } from '@/lib/toyyibpay'

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
  title: string
  subtitle?: string
  description: string
  content?: string
  featuredImage?: string
  gallery?: string[]
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
  budget?: string
  beneficiaries?: number
  location?: string
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
  // Donation fields
  donationEnabled?: boolean
  donationGoal?: number
}) {
  const user = await requireAuth()

  // If donation is enabled, create ToyyibPay category
  let toyyibpayCategoryCode: string | undefined
  if (data.donationEnabled && ToyyibPayService.isConfigured()) {
    try {
      toyyibpayCategoryCode = await ToyyibPayService.createCategory({
        catname: data.title.substring(0, 30), // Max 30 chars
        catdescription: `Donations for ${data.title}`.substring(0, 100), // Max 100 chars
      })
      console.log(`Created ToyyibPay category for project: ${toyyibpayCategoryCode}`)
    } catch (error) {
      console.error('Failed to create ToyyibPay category:', error)
      // Don't fail the project creation, just log the error
      // Category can be created later when updating
    }
  }

  const project = await db.insert(projects).values({
    ...data,
    gallery: data.gallery,
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
  await logActivity('content_create', `Created project: ${data.title}`, {
    contentType: 'projects',
    contentId: project[0].id,
    contentTitle: data.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (data.isPublished) {
    await notifyProjectPublished({
      projectId: project[0].id,
      title: data.title,
      authorName: user.name,
    })
  }

  revalidatePath('/projects')
  revalidatePath('/donate')
  return { success: true, project: project[0] }
}

export async function updateProject(id: string, data: {
  slug?: string
  title?: string
  subtitle?: string
  description?: string
  content?: string
  featuredImage?: string
  gallery?: string[]
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
  budget?: string
  beneficiaries?: number
  location?: string
  metaTitle?: string
  metaDescription?: string
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
      const projectTitle = data.title || existing.title
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

  // Prepare update data
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
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
  await logActivity(`content_${changeType}`, `${actionText} project: ${existing.title}`, {
    contentType: 'projects',
    contentId: id,
    contentTitle: existing.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (changeType === 'publish') {
    await notifyProjectPublished({
      projectId: id,
      title: data.title || existing.title,
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
    { customSummary: `Deleted project: ${existing.title}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted project: ${existing.title}`, {
    contentType: 'projects',
    contentId: id,
    contentTitle: existing.title,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(projects).where(eq(projects.id, id))

  revalidatePath('/projects')
  return { success: true }
}
