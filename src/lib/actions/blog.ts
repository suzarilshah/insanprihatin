'use server'

import { revalidatePath } from 'next/cache'
import { db, blogPosts } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyBlogPublished } from '@/lib/actions/notifications'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'
import { autoTranslateFields } from '@/lib/auto-translate'

type LocalizedField = LocalizedString | string

// Helper to get string value from LocalizedString (for logging/notifications)
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

// Helper to ensure required fields have LocalizedString
const toLocalizedRequired = (value: LocalizedField): LocalizedString => {
  if (typeof value === 'string') return { en: value, ms: value }
  return value
}

export async function getBlogPosts(options?: { published?: boolean; limit?: number }) {
  const conditions = []

  if (options?.published !== undefined) {
    conditions.push(eq(blogPosts.isPublished, options.published))
  }

  const posts = await db.query.blogPosts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
    limit: options?.limit,
  })

  return posts
}

export async function getBlogPost(slug: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  })
  return post
}

export async function createBlogPost(data: {
  slug: string
  title: LocalizedField
  excerpt?: LocalizedField
  content: LocalizedField
  featuredImage?: string
  category?: string
  tags?: string[]
  metaTitle?: LocalizedField
  metaDescription?: LocalizedField
  isPublished?: boolean
}) {
  const user = await requireAuth()

  // Auto-translate any fields that are missing one language
  console.log('[Blog] Auto-translating content...')
  const translated = await autoTranslateFields({
    title: toLocalizedRequired(data.title),
    excerpt: toLocalized(data.excerpt),
    content: toLocalizedRequired(data.content),
    metaTitle: toLocalized(data.metaTitle),
    metaDescription: toLocalized(data.metaDescription),
  })
  console.log('[Blog] Auto-translation complete')

  const post = await db.insert(blogPosts).values({
    slug: data.slug,
    title: translated.title || toLocalizedRequired(data.title),
    excerpt: translated.excerpt,
    content: translated.content || toLocalizedRequired(data.content),
    featuredImage: data.featuredImage,
    category: data.category,
    tags: data.tags,
    metaTitle: translated.metaTitle,
    metaDescription: translated.metaDescription,
    isPublished: data.isPublished,
    publishedAt: data.isPublished ? new Date() : null,
  }).returning()

  // Create version record
  await createVersion(
    'blog_posts',
    post[0].id,
    post[0] as Record<string, unknown>,
    'create',
    { id: user.id, email: user.email, name: user.name }
  )

  // Log activity
  await logActivity('content_create', `Created blog post: ${l(data.title)}`, {
    contentType: 'blog_posts',
    contentId: post[0].id,
    contentTitle: l(data.title),
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (data.isPublished) {
    await notifyBlogPublished({
      postId: post[0].id,
      title: l(data.title),
      authorName: user.name,
    })
  }

  revalidatePath('/blog')
  return { success: true, post: post[0] }
}

export async function updateBlogPost(id: string, data: {
  slug?: string
  title?: LocalizedField
  excerpt?: LocalizedField
  content?: LocalizedField
  featuredImage?: string
  category?: string
  tags?: string[]
  metaTitle?: LocalizedField
  metaDescription?: LocalizedField
  isPublished?: boolean
}) {
  const user = await requireAuth()

  // Get existing data for version comparison
  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Post not found' }
  }

  // Auto-translate any fields that are missing one language
  const fieldsToTranslate: Record<string, LocalizedString | string | null | undefined> = {}
  if (data.title !== undefined) fieldsToTranslate.title = toLocalizedRequired(data.title)
  if (data.excerpt !== undefined) fieldsToTranslate.excerpt = toLocalized(data.excerpt)
  if (data.content !== undefined) fieldsToTranslate.content = toLocalizedRequired(data.content)
  if (data.metaTitle !== undefined) fieldsToTranslate.metaTitle = toLocalized(data.metaTitle)
  if (data.metaDescription !== undefined) fieldsToTranslate.metaDescription = toLocalized(data.metaDescription)

  let translated: Record<string, LocalizedString | undefined> = {}
  if (Object.keys(fieldsToTranslate).length > 0) {
    console.log('[Blog] Auto-translating updated content...')
    translated = await autoTranslateFields(fieldsToTranslate)
    console.log('[Blog] Auto-translation complete')
  }

  // Handle publishing logic - convert LocalizedField to LocalizedString for database
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.title !== undefined && { title: translated.title || toLocalizedRequired(data.title) }),
    ...(data.excerpt !== undefined && { excerpt: translated.excerpt }),
    ...(data.content !== undefined && { content: translated.content || toLocalizedRequired(data.content) }),
    ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.metaTitle !== undefined && { metaTitle: translated.metaTitle }),
    ...(data.metaDescription !== undefined && { metaDescription: translated.metaDescription }),
    ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
  }

  // Determine change type (publish/unpublish/update)
  let changeType: 'update' | 'publish' | 'unpublish' = 'update'
  if (data.isPublished !== undefined && data.isPublished !== existing.isPublished) {
    changeType = data.isPublished ? 'publish' : 'unpublish'
    // If publishing for the first time, set publishedAt
    if (data.isPublished && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  await db
    .update(blogPosts)
    .set(updateData)
    .where(eq(blogPosts.id, id))

  // Get updated data
  const updated = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  })

  // Create version record
  await createVersion(
    'blog_posts',
    id,
    updated as Record<string, unknown>,
    changeType,
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> }
  )

  // Log activity
  const actionText = changeType === 'publish' ? 'Published' : changeType === 'unpublish' ? 'Unpublished' : 'Updated'
  await logActivity(`content_${changeType}`, `${actionText} blog post: ${l(existing.title)}`, {
    contentType: 'blog_posts',
    contentId: id,
    contentTitle: l(existing.title),
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (changeType === 'publish') {
    await notifyBlogPublished({
      postId: id,
      title: l(data.title) || l(existing.title),
      authorName: user.name,
    })
  }

  revalidatePath('/blog')
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`)
  }

  return { success: true }
}

export async function deleteBlogPost(id: string) {
  const user = await requireAuth()

  // Get existing data before deletion to preserve in version history
  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Post not found' }
  }

  // Create version record BEFORE deletion (to preserve the deleted content)
  await createVersion(
    'blog_posts',
    id,
    existing as Record<string, unknown>,
    'delete',
    { id: user.id, email: user.email, name: user.name },
    { customSummary: `Deleted blog post: ${l(existing.title)}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted blog post: ${l(existing.title)}`, {
    contentType: 'blog_posts',
    contentId: id,
    contentTitle: l(existing.title),
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(blogPosts).where(eq(blogPosts.id, id))

  revalidatePath('/blog')
  return { success: true }
}
