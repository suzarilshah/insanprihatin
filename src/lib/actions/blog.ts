'use server'

import { revalidatePath } from 'next/cache'
import { db, blogPosts } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyBlogPublished } from '@/lib/actions/notifications'

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
  title: string
  excerpt?: string
  content: string
  featuredImage?: string
  category?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
}) {
  const user = await requireAuth()

  const post = await db.insert(blogPosts).values({
    ...data,
    tags: data.tags,
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
  await logActivity('content_create', `Created blog post: ${data.title}`, {
    contentType: 'blog_posts',
    contentId: post[0].id,
    contentTitle: data.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (data.isPublished) {
    await notifyBlogPublished({
      postId: post[0].id,
      title: data.title,
      authorName: user.name,
    })
  }

  revalidatePath('/blog')
  return { success: true, post: post[0] }
}

export async function updateBlogPost(id: string, data: {
  slug?: string
  title?: string
  excerpt?: string
  content?: string
  featuredImage?: string
  category?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
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

  // Handle publishing logic
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }

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
  await logActivity(`content_${changeType}`, `${actionText} blog post: ${existing.title}`, {
    contentType: 'blog_posts',
    contentId: id,
    contentTitle: existing.title,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification if published
  if (changeType === 'publish') {
    await notifyBlogPublished({
      postId: id,
      title: data.title || existing.title,
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
    { customSummary: `Deleted blog post: ${existing.title}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted blog post: ${existing.title}`, {
    contentType: 'blog_posts',
    contentId: id,
    contentTitle: existing.title,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  await db.delete(blogPosts).where(eq(blogPosts.id, id))

  revalidatePath('/blog')
  return { success: true }
}
