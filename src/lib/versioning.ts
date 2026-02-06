import { db, contentVersions, activityLog } from '@/db'
import { eq, and, desc, sql } from 'drizzle-orm'

// Supported content types for versioning
export type ContentType =
  | 'blog_posts'
  | 'projects'
  | 'team_members'
  | 'hero_content'
  | 'about_content'
  | 'impact_stats'
  | 'partners'
  | 'testimonials'
  | 'faqs'
  | 'pages'
  | 'site_settings'

// Change types
export type ChangeType = 'create' | 'update' | 'delete' | 'restore' | 'publish' | 'unpublish'

// User info for tracking
export interface UserInfo {
  id?: string
  email: string
  name: string
}

// Version record interface
export interface ContentVersion {
  id: string
  contentType: ContentType
  contentId: string
  versionNumber: number
  data: Record<string, unknown>
  changeType: ChangeType
  changeSummary: string | null
  changedFields: string[] | null
  changedBy: string | null
  changedByEmail: string | null
  changedByName: string | null
  createdAt: Date
}

// Activity log interface
export interface ActivityLogEntry {
  id: string
  eventType: string
  eventDescription: string
  contentType: string | null
  contentId: string | null
  contentTitle: string | null
  userId: string | null
  userEmail: string | null
  userName: string | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

/**
 * Get the next version number for a content item
 */
async function getNextVersionNumber(contentType: ContentType, contentId: string): Promise<number> {
  const result = await db
    .select({ maxVersion: sql<number>`COALESCE(MAX(${contentVersions.versionNumber}), 0)` })
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.contentType, contentType),
        eq(contentVersions.contentId, contentId)
      )
    )

  return (result[0]?.maxVersion || 0) + 1
}

/**
 * Detect which fields changed between two versions
 */
function detectChangedFields(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>
): string[] {
  if (!oldData) {
    return Object.keys(newData)
  }

  const changedFields: string[] = []
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

  for (const key of allKeys) {
    // Skip internal fields
    if (['createdAt', 'updatedAt', 'id'].includes(key)) continue

    const oldValue = JSON.stringify(oldData[key])
    const newValue = JSON.stringify(newData[key])

    if (oldValue !== newValue) {
      changedFields.push(key)
    }
  }

  return changedFields
}

/**
 * Generate a human-readable change summary
 */
function generateChangeSummary(
  changeType: ChangeType,
  changedFields: string[],
  contentType: ContentType
): string {
  const contentTypeName = contentType.replace(/_/g, ' ').replace(/s$/, '')

  switch (changeType) {
    case 'create':
      return `Created new ${contentTypeName}`
    case 'delete':
      return `Deleted ${contentTypeName}`
    case 'restore':
      return `Restored ${contentTypeName} from previous version`
    case 'publish':
      return `Published ${contentTypeName}`
    case 'unpublish':
      return `Unpublished ${contentTypeName}`
    case 'update':
      if (changedFields.length === 0) {
        return `Updated ${contentTypeName}`
      } else if (changedFields.length <= 3) {
        return `Updated ${changedFields.join(', ')}`
      } else {
        return `Updated ${changedFields.length} fields`
      }
    default:
      return `Modified ${contentTypeName}`
  }
}

/**
 * Check if a string is a valid UUID
 */
function isValidUUID(str: string | undefined | null): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Create a version record for content
 */
export async function createVersion(
  contentType: ContentType,
  contentId: string,
  data: Record<string, unknown>,
  changeType: ChangeType,
  user: UserInfo,
  options?: {
    previousData?: Record<string, unknown> | null
    customSummary?: string
  }
): Promise<ContentVersion> {
  const versionNumber = await getNextVersionNumber(contentType, contentId)
  const changedFields = detectChangedFields(options?.previousData || null, data)
  const changeSummary = options?.customSummary || generateChangeSummary(changeType, changedFields, contentType)

  // Only use user.id if it's a valid UUID, otherwise set to null
  // (user.id might be an email when UUID is not available from auth provider)
  const changedByUUID = isValidUUID(user.id) ? user.id : null

  const [version] = await db
    .insert(contentVersions)
    .values({
      contentType,
      contentId,
      versionNumber,
      data,
      changeType,
      changeSummary,
      changedFields,
      changedBy: changedByUUID,
      changedByEmail: user.email,
      changedByName: user.name,
    })
    .returning()

  return version as ContentVersion
}

/**
 * Get version history for a content item
 */
export async function getVersionHistory(
  contentType: ContentType,
  contentId: string,
  limit = 50
): Promise<ContentVersion[]> {
  const versions = await db
    .select()
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.contentType, contentType),
        eq(contentVersions.contentId, contentId)
      )
    )
    .orderBy(desc(contentVersions.versionNumber))
    .limit(limit)

  return versions as ContentVersion[]
}

/**
 * Get a specific version
 */
export async function getVersion(versionId: string): Promise<ContentVersion | null> {
  const [version] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.id, versionId))
    .limit(1)

  return version as ContentVersion | null
}

/**
 * Get the latest version of content
 */
export async function getLatestVersion(
  contentType: ContentType,
  contentId: string
): Promise<ContentVersion | null> {
  const [version] = await db
    .select()
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.contentType, contentType),
        eq(contentVersions.contentId, contentId)
      )
    )
    .orderBy(desc(contentVersions.versionNumber))
    .limit(1)

  return version as ContentVersion | null
}

/**
 * Compare two versions and return the differences
 */
export function compareVersions(
  versionA: ContentVersion,
  versionB: ContentVersion
): {
  added: string[]
  removed: string[]
  modified: string[]
  changes: Record<string, { old: unknown; new: unknown }>
} {
  const dataA = versionA.data as Record<string, unknown>
  const dataB = versionB.data as Record<string, unknown>
  const allKeys = new Set([...Object.keys(dataA), ...Object.keys(dataB)])

  const added: string[] = []
  const removed: string[] = []
  const modified: string[] = []
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  for (const key of allKeys) {
    // Skip internal fields
    if (['createdAt', 'updatedAt', 'id'].includes(key)) continue

    const valueA = dataA[key]
    const valueB = dataB[key]

    if (valueA === undefined && valueB !== undefined) {
      added.push(key)
      changes[key] = { old: undefined, new: valueB }
    } else if (valueA !== undefined && valueB === undefined) {
      removed.push(key)
      changes[key] = { old: valueA, new: undefined }
    } else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
      modified.push(key)
      changes[key] = { old: valueA, new: valueB }
    }
  }

  return { added, removed, modified, changes }
}

/**
 * Log an activity event
 */
export async function logActivity(
  eventType: string,
  eventDescription: string,
  options?: {
    contentType?: ContentType
    contentId?: string
    contentTitle?: string
    user?: UserInfo
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }
): Promise<ActivityLogEntry> {
  // Only use user.id if it's a valid UUID (see isValidUUID above)
  const userIdUUID = isValidUUID(options?.user?.id) ? options?.user?.id : null

  const [entry] = await db
    .insert(activityLog)
    .values({
      eventType,
      eventDescription,
      contentType: options?.contentType || null,
      contentId: options?.contentId || null,
      contentTitle: options?.contentTitle || null,
      userId: userIdUUID,
      userEmail: options?.user?.email || null,
      userName: options?.user?.name || null,
      ipAddress: options?.ipAddress || null,
      userAgent: options?.userAgent || null,
      metadata: options?.metadata || null,
    })
    .returning()

  return entry as ActivityLogEntry
}

/**
 * Get activity log entries
 */
export async function getActivityLog(options?: {
  contentType?: ContentType
  contentId?: string
  userId?: string
  eventType?: string
  limit?: number
  offset?: number
}): Promise<ActivityLogEntry[]> {
  let query = db.select().from(activityLog)

  const conditions = []
  if (options?.contentType) {
    conditions.push(eq(activityLog.contentType, options.contentType))
  }
  if (options?.contentId) {
    conditions.push(eq(activityLog.contentId, options.contentId))
  }
  if (options?.userId) {
    conditions.push(eq(activityLog.userId, options.userId))
  }
  if (options?.eventType) {
    conditions.push(eq(activityLog.eventType, options.eventType))
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  const entries = await query
    .orderBy(desc(activityLog.createdAt))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0)

  return entries as ActivityLogEntry[]
}

/**
 * Get version statistics for dashboard
 */
export async function getVersionStats(): Promise<{
  totalVersions: number
  versionsByType: Record<string, number>
  recentActivity: ActivityLogEntry[]
}> {
  // Total versions
  const [totalResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(contentVersions)

  // Versions by type
  const typeResults = await db
    .select({
      contentType: contentVersions.contentType,
      count: sql<number>`COUNT(*)`,
    })
    .from(contentVersions)
    .groupBy(contentVersions.contentType)

  const versionsByType: Record<string, number> = {}
  for (const result of typeResults) {
    versionsByType[result.contentType] = Number(result.count)
  }

  // Recent activity
  const recentActivity = await getActivityLog({ limit: 10 })

  return {
    totalVersions: Number(totalResult?.count || 0),
    versionsByType,
    recentActivity,
  }
}

/**
 * Clean up old versions (keep last N versions per content item)
 */
export async function cleanupOldVersions(
  contentType: ContentType,
  contentId: string,
  keepCount = 50
): Promise<number> {
  // Get versions to delete
  const allVersions = await db
    .select({ id: contentVersions.id })
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.contentType, contentType),
        eq(contentVersions.contentId, contentId)
      )
    )
    .orderBy(desc(contentVersions.versionNumber))

  if (allVersions.length <= keepCount) {
    return 0
  }

  const versionsToDelete = allVersions.slice(keepCount)
  const idsToDelete = versionsToDelete.map(v => v.id)

  // Delete old versions
  let deletedCount = 0
  for (const id of idsToDelete) {
    await db.delete(contentVersions).where(eq(contentVersions.id, id))
    deletedCount++
  }

  return deletedCount
}

// Export table references for use in API routes
export { contentVersions, activityLog }
