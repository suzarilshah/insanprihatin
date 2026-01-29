import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db, contentVersions } from '@/db'
import { eq, desc } from 'drizzle-orm'
import {
  getVersionHistory,
  getActivityLog,
  getVersionStats,
  type ContentType,
} from '@/lib/versioning'

// GET /api/versions - Get version history or activity log
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType') as ContentType | null
    const contentId = searchParams.get('contentId')
    const type = searchParams.get('type') || 'versions' // 'versions', 'activity', 'stats'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get stats
    if (type === 'stats') {
      const stats = await getVersionStats()
      return NextResponse.json(stats)
    }

    // Get activity log
    if (type === 'activity') {
      const activity = await getActivityLog({
        contentType: contentType || undefined,
        contentId: contentId || undefined,
        limit,
        offset,
      })
      return NextResponse.json(activity)
    }

    // Get version history by content type only (for browsing all versions of a type)
    if (contentType && !contentId) {
      const versions = await db.query.contentVersions.findMany({
        where: eq(contentVersions.contentType, contentType),
        orderBy: [desc(contentVersions.createdAt)],
        limit,
        offset,
      })
      return NextResponse.json(versions)
    }

    // Get version history for specific content item
    if (contentType && contentId) {
      const versions = await getVersionHistory(contentType, contentId, limit)
      return NextResponse.json(versions)
    }

    // No content type specified - return all recent versions
    const versions = await db.query.contentVersions.findMany({
      orderBy: [desc(contentVersions.createdAt)],
      limit,
      offset,
    })
    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}
