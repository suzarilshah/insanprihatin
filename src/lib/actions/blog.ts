'use server'

import { revalidatePath } from 'next/cache'
import { db, blogPosts } from '@/db'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'

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
  await requireAuth()

  const post = await db.insert(blogPosts).values({
    ...data,
    tags: data.tags,
    publishedAt: data.isPublished ? new Date() : null,
  }).returning()

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
  await requireAuth()

  // Handle publishing logic
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }

  if (data.isPublished !== undefined) {
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
    })

    // If publishing for the first time, set publishedAt
    if (data.isPublished && !existing?.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  await db
    .update(blogPosts)
    .set(updateData)
    .where(eq(blogPosts.id, id))

  revalidatePath('/blog')
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`)
  }

  return { success: true }
}

export async function deleteBlogPost(id: string) {
  await requireAuth()

  await db.delete(blogPosts).where(eq(blogPosts.id, id))

  revalidatePath('/blog')
  return { success: true }
}
