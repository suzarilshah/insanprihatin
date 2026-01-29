'use server'

import { revalidatePath } from 'next/cache'
import { db, projects } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'

export async function getProjects(options?: { published?: boolean; category?: string; status?: string; limit?: number }) {
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
}) {
  await requireAuth()

  const project = await db.insert(projects).values({
    ...data,
    gallery: data.gallery,
  }).returning()

  revalidatePath('/projects')
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
}) {
  await requireAuth()

  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))

  revalidatePath('/projects')
  if (data.slug) {
    revalidatePath(`/projects/${data.slug}`)
  }

  return { success: true }
}

export async function deleteProject(id: string) {
  await requireAuth()

  await db.delete(projects).where(eq(projects.id, id))

  revalidatePath('/projects')
  return { success: true }
}
