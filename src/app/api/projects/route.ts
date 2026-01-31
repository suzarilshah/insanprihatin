import { NextRequest, NextResponse } from 'next/server'
import { db, projects } from '@/db'
import { eq, desc, and } from 'drizzle-orm'

// GET - List projects with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donationEnabled = searchParams.get('donationEnabled')
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    const conditions = []

    if (donationEnabled === 'true') {
      conditions.push(eq(projects.donationEnabled, true))
    }

    if (published === 'true') {
      conditions.push(eq(projects.isPublished, true))
    }

    if (category) {
      conditions.push(eq(projects.category, category))
    }

    if (status) {
      conditions.push(eq(projects.status, status))
    }

    const projectsList = await db.query.projects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(projects.createdAt)],
      limit: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(projectsList)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
