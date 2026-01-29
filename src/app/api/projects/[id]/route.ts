import { NextRequest, NextResponse } from 'next/server'
import { db, projects } from '@/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
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
