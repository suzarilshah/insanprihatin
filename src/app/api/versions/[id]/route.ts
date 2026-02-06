import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { db, blogPosts, projects, teamMembers, heroContent, aboutContent, impactStats, partners, testimonials, faqs, pages } from '@/db'
import { eq } from 'drizzle-orm'
import {
  getVersion,
  createVersion,
  logActivity,
  type ContentType,
} from '@/lib/versioning'

// Content type to table mapping
const contentTypeToTable: Record<ContentType, typeof blogPosts | typeof projects | typeof teamMembers | typeof heroContent | typeof aboutContent | typeof impactStats | typeof partners | typeof testimonials | typeof faqs | typeof pages> = {
  blog_posts: blogPosts,
  projects: projects,
  team_members: teamMembers,
  hero_content: heroContent,
  about_content: aboutContent,
  impact_stats: impactStats,
  partners: partners,
  testimonials: testimonials,
  faqs: faqs,
  pages: pages,
  site_settings: pages, // Placeholder, site_settings has different structure
}

// GET /api/versions/[id] - Get a specific version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const version = await getVersion(id)

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error fetching version:', error)
    return NextResponse.json(
      { error: 'Failed to fetch version' },
      { status: 500 }
    )
  }
}

// POST /api/versions/[id]/restore - Restore content to this version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const version = await getVersion(id)

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const contentType = version.contentType as ContentType
    const contentId = version.contentId
    const versionData = version.data as Record<string, unknown>

    // Get the table for this content type
    const table = contentTypeToTable[contentType]
    if (!table) {
      return NextResponse.json(
        { error: 'Unsupported content type for restoration' },
        { status: 400 }
      )
    }

    // Prepare the data for restoration (remove internal fields)
    const restorationData = { ...versionData }
    delete restorationData.id
    delete restorationData.createdAt
    restorationData.updatedAt = new Date()

    // Get the current data before restoration
    const [currentContent] = await db
      .select()
      .from(table)
      .where(eq(table.id, contentId))
      .limit(1)

    if (!currentContent) {
      // Content was deleted, we need to re-create it
      // This is a special case for deleted content restoration
      const insertData = {
        ...restorationData,
        id: contentId,
        createdAt: new Date(),
      }

      await db.insert(table).values(insertData as typeof table.$inferInsert)
    } else {
      // Update existing content
      await db
        .update(table)
        .set(restorationData as Partial<typeof table.$inferInsert>)
        .where(eq(table.id, contentId))
    }

    // Get the restored content
    const [restoredContent] = await db
      .select()
      .from(table)
      .where(eq(table.id, contentId))
      .limit(1)

    // Create a new version for the restoration
    const user = {
      id: session.user?.id || session.user?.email || 'unknown',
      email: session.user?.email || '',
      name: session.user?.name || 'Unknown',
    }

    await createVersion(
      contentType,
      contentId,
      restoredContent as Record<string, unknown>,
      'restore',
      user,
      {
        previousData: currentContent as Record<string, unknown> | null,
        customSummary: `Restored to version ${version.versionNumber}`,
      }
    )

    // Log the activity
    await logActivity(
      'content_restore',
      `Restored ${contentType.replace(/_/g, ' ')} to version ${version.versionNumber}`,
      {
        contentType,
        contentId,
        contentTitle: (versionData.title as string) || (versionData.name as string) || contentId,
        user,
        metadata: {
          restoredFromVersion: version.versionNumber,
          restoredFromId: version.id,
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: `Content restored to version ${version.versionNumber}`,
      content: restoredContent,
    })
  } catch (error) {
    console.error('Error restoring version:', error)
    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    )
  }
}
