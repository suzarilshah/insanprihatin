import { NextRequest, NextResponse } from 'next/server'
import { db, blogPosts } from '@/db'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth/server'

// SECURITY: Public endpoint but only returns published posts for unauthenticated users
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user is authenticated (admin)
    const session = await getSession()
    const isAdmin = !!session

    // Build query conditions
    const conditions = [eq(blogPosts.id, id)]

    // SECURITY: Only return published posts to unauthenticated users
    if (!isAdmin) {
      conditions.push(eq(blogPosts.isPublished, true))
    }

    const post = await db.query.blogPosts.findFirst({
      where: and(...conditions),
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to get blog post:', error)
    return NextResponse.json({ error: 'Failed to get post' }, { status: 500 })
  }
}
