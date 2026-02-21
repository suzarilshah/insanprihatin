import { NextRequest, NextResponse } from 'next/server'
import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { RateLimiters } from '@/lib/api-rate-limit'
import { getSession } from '@/lib/auth/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await RateLimiters.general(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await params
    const session = await getSession()
    const isAdmin = !!session

    const conditions = [eq(projects.id, id)]
    if (!isAdmin) {
      conditions.push(eq(projects.isPublished, true))
    }

    const project = await db.query.projects.findFirst({
      where: and(...conditions),
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to get project:', error)
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 })
  }
}
