import { NextRequest, NextResponse } from 'next/server'
import { db, blogPosts } from '@/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
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
