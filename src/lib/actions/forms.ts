'use server'

import { revalidatePath } from 'next/cache'
import { db, contentForms, formSubmissions, blogPosts, projects } from '@/db'
import { eq, desc, and, count, sql, like } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

// Get all forms
export async function getForms(options?: { active?: boolean }) {
  const conditions = []

  if (options?.active !== undefined) {
    conditions.push(eq(contentForms.isActive, options.active))
  }

  const forms = await db.query.contentForms.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(contentForms.createdAt)],
  })

  return forms
}

// Get form by ID
export async function getForm(id: string) {
  const form = await db.query.contentForms.findFirst({
    where: eq(contentForms.id, id),
  })
  return form
}

// Get form by slug
export async function getFormBySlug(slug: string) {
  const form = await db.query.contentForms.findFirst({
    where: eq(contentForms.slug, slug),
  })
  return form
}

// Get forms by slugs (for content rendering)
export async function getFormsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return []

  const forms = await db.query.contentForms.findMany({
    where: and(
      eq(contentForms.isActive, true)
    ),
  })

  return forms.filter(form => slugs.includes(form.slug))
}

// Create form
export async function createForm(data: {
  name: string
  slug: string
  title?: string
  description?: string
  submitButtonText?: string
  successMessage?: string
  fields: FormField[]
  sendEmailNotification?: boolean
  notificationEmail?: string
  linkedContentType?: string
  linkedContentId?: string
}) {
  await requireAuth()

  const form = await db.insert(contentForms).values({
    name: data.name,
    slug: data.slug,
    title: data.title,
    description: data.description,
    submitButtonText: data.submitButtonText || 'Submit',
    successMessage: data.successMessage || 'Thank you for your submission!',
    fields: data.fields as unknown as Record<string, unknown>,
    sendEmailNotification: data.sendEmailNotification ?? true,
    notificationEmail: data.notificationEmail,
    linkedContentType: data.linkedContentType,
    linkedContentId: data.linkedContentId,
    isActive: true,
  }).returning()

  revalidatePath('/admin/dashboard/forms')
  return { success: true, form: form[0] }
}

// Update form
export async function updateForm(id: string, data: {
  name?: string
  slug?: string
  title?: string
  description?: string
  submitButtonText?: string
  successMessage?: string
  fields?: FormField[]
  sendEmailNotification?: boolean
  notificationEmail?: string
  linkedContentType?: string
  linkedContentId?: string
  isActive?: boolean
}) {
  await requireAuth()

  const existing = await db.query.contentForms.findFirst({
    where: eq(contentForms.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Form not found' }
  }

  await db
    .update(contentForms)
    .set({
      ...data,
      fields: data.fields ? (data.fields as unknown as Record<string, unknown>) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(contentForms.id, id))

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}

// Delete form
export async function deleteForm(id: string) {
  await requireAuth()

  const existing = await db.query.contentForms.findFirst({
    where: eq(contentForms.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Form not found' }
  }

  await db.delete(contentForms).where(eq(contentForms.id, id))

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}

// Get form submissions
export async function getFormSubmissions(options?: { formId?: string; formSlug?: string; isRead?: boolean; limit?: number }) {
  const conditions = []

  if (options?.formId) {
    conditions.push(eq(formSubmissions.formId, options.formId))
  }

  if (options?.formSlug) {
    conditions.push(eq(formSubmissions.formSlug, options.formSlug))
  }

  if (options?.isRead !== undefined) {
    conditions.push(eq(formSubmissions.isRead, options.isRead))
  }

  const submissions = await db.query.formSubmissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(formSubmissions.createdAt)],
    limit: options?.limit,
  })

  return submissions
}

// Create form submission (called from API route)
export async function createFormSubmission(data: {
  formId: string
  formSlug: string
  data: Record<string, unknown>
  sourceUrl?: string
  sourceContentType?: string
  sourceContentId?: string
  sourceContentTitle?: string
  submitterEmail?: string
  submitterName?: string
}) {
  const submission = await db.insert(formSubmissions).values({
    formId: data.formId,
    formSlug: data.formSlug,
    data: data.data,
    sourceUrl: data.sourceUrl,
    sourceContentType: data.sourceContentType,
    sourceContentId: data.sourceContentId,
    sourceContentTitle: data.sourceContentTitle,
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName,
    isRead: false,
  }).returning()

  return { success: true, submission: submission[0] }
}

// Mark submission as read
export async function markSubmissionAsRead(id: string) {
  await requireAuth()

  await db
    .update(formSubmissions)
    .set({ isRead: true })
    .where(eq(formSubmissions.id, id))

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}

// Delete submission
export async function deleteFormSubmission(id: string) {
  await requireAuth()

  await db.delete(formSubmissions).where(eq(formSubmissions.id, id))

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}

// Extract form slugs from content - async wrapper for server action compatibility
export async function extractFormSlugs(content: string): Promise<string[]> {
  const formPattern = /\{\{form:([a-zA-Z0-9-_]+)\}\}/g
  const slugs: string[] = []
  let match

  while ((match = formPattern.exec(content)) !== null) {
    slugs.push(match[1])
  }

  return [...new Set(slugs)] // Return unique slugs
}

// Get submission count for a form
export async function getFormSubmissionCount(formId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId))

  return result[0]?.count || 0
}

// Get unread submission count for a form
export async function getFormUnreadCount(formId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(formSubmissions)
    .where(and(
      eq(formSubmissions.formId, formId),
      eq(formSubmissions.isRead, false)
    ))

  return result[0]?.count || 0
}

// Get all forms with submission counts
export async function getFormsWithStats() {
  const forms = await db.query.contentForms.findMany({
    orderBy: [desc(contentForms.createdAt)],
  })

  // Get submission counts for each form
  const formsWithStats = await Promise.all(
    forms.map(async (form) => {
      const totalSubmissions = await getFormSubmissionCount(form.id)
      const unreadSubmissions = await getFormUnreadCount(form.id)

      return {
        ...form,
        totalSubmissions,
        unreadSubmissions,
      }
    })
  )

  return formsWithStats
}

// Find content that uses a specific form
export async function getFormUsage(formSlug: string) {
  const pattern = `%{{form:${formSlug}}}%`

  // Find blog posts using this form
  const blogPostsUsingForm = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      isPublished: blogPosts.isPublished,
    })
    .from(blogPosts)
    .where(like(blogPosts.content, pattern))

  // Find projects using this form
  const projectsUsingForm = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      isPublished: projects.isPublished,
    })
    .from(projects)
    .where(like(projects.content, pattern))

  return {
    blogPosts: blogPostsUsingForm,
    projects: projectsUsingForm,
    totalUsage: blogPostsUsingForm.length + projectsUsingForm.length,
  }
}

// Get all forms with stats and usage
export async function getFormsWithStatsAndUsage() {
  const forms = await db.query.contentForms.findMany({
    orderBy: [desc(contentForms.createdAt)],
  })

  const formsWithData = await Promise.all(
    forms.map(async (form) => {
      const [totalSubmissions, unreadSubmissions, usage] = await Promise.all([
        getFormSubmissionCount(form.id),
        getFormUnreadCount(form.id),
        getFormUsage(form.slug),
      ])

      return {
        ...form,
        totalSubmissions,
        unreadSubmissions,
        usage,
      }
    })
  )

  return formsWithData
}

// Get form with full details including stats and submissions
export async function getFormWithDetails(id: string) {
  const form = await db.query.contentForms.findFirst({
    where: eq(contentForms.id, id),
  })

  if (!form) return null

  const [submissions, usage] = await Promise.all([
    getFormSubmissions({ formId: id }),
    getFormUsage(form.slug),
  ])

  const totalSubmissions = submissions.length
  const unreadSubmissions = submissions.filter(s => !s.isRead).length

  return {
    ...form,
    submissions,
    usage,
    totalSubmissions,
    unreadSubmissions,
  }
}

// Get single submission with full details
export async function getFormSubmission(id: string) {
  const submission = await db.query.formSubmissions.findFirst({
    where: eq(formSubmissions.id, id),
  })
  return submission
}

// Mark multiple submissions as read
export async function markMultipleSubmissionsAsRead(ids: string[]) {
  await requireAuth()

  await Promise.all(
    ids.map(id =>
      db
        .update(formSubmissions)
        .set({ isRead: true })
        .where(eq(formSubmissions.id, id))
    )
  )

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}

// Delete multiple submissions
export async function deleteMultipleSubmissions(ids: string[]) {
  await requireAuth()

  await Promise.all(
    ids.map(id =>
      db.delete(formSubmissions).where(eq(formSubmissions.id, id))
    )
  )

  revalidatePath('/admin/dashboard/forms')
  return { success: true }
}
