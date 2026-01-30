'use server'

import { revalidatePath } from 'next/cache'
import { db, adminNotifications } from '@/db'
import { eq, desc, and, lt, count, sql, isNull, or } from 'drizzle-orm'

// Notification types
export type NotificationType =
  | 'blog_published'
  | 'project_published'
  | 'form_submission'
  | 'contact_message'
  | 'team_update'
  | 'donation_received'
  | 'org_chart_update'
  | 'm365_sync'
  | 'system'

// Notification priority
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// Related content types
export type RelatedType =
  | 'blog_posts'
  | 'projects'
  | 'forms'
  | 'form_submissions'
  | 'team_members'
  | 'donations'
  | 'messages'

// Notification interface
export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  icon: string | null
  relatedType: RelatedType | null
  relatedId: string | null
  relatedUrl: string | null
  metadata: Record<string, unknown> | null
  isRead: boolean
  isDismissed: boolean
  expiresAt: Date | null
  createdAt: Date
  readAt: Date | null
}

// Notification icon mapping based on type
const notificationIcons: Record<NotificationType, string> = {
  blog_published: 'newspaper',
  project_published: 'folder',
  form_submission: 'clipboard-document-check',
  contact_message: 'envelope',
  team_update: 'users',
  donation_received: 'currency-dollar',
  org_chart_update: 'organization-chart',
  m365_sync: 'cloud-arrow-down',
  system: 'cog',
}

// Notification URL mapping
function getRelatedUrl(relatedType: RelatedType | null, relatedId: string | null): string | null {
  if (!relatedType || !relatedId) return null

  const urlMap: Record<RelatedType, (id: string) => string> = {
    blog_posts: (id) => `/admin/dashboard/blog/${id}`,
    projects: (id) => `/admin/dashboard/projects/${id}`,
    forms: (id) => `/admin/dashboard/forms/${id}`,
    form_submissions: (id) => `/admin/dashboard/forms`, // Navigate to forms list, can't deep link to submission
    team_members: (id) => `/admin/dashboard/team`,
    donations: (id) => `/admin/dashboard/donations`,
    messages: (id) => `/admin/dashboard/messages`,
  }

  return urlMap[relatedType]?.(relatedId) || null
}

/**
 * Create a new notification
 */
export async function createNotification(data: {
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  icon?: string
  relatedType?: RelatedType
  relatedId?: string
  relatedUrl?: string
  metadata?: Record<string, unknown>
  expiresAt?: Date
}): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const computedUrl = data.relatedUrl || getRelatedUrl(data.relatedType || null, data.relatedId || null)
    const computedIcon = data.icon || notificationIcons[data.type]

    const [notification] = await db
      .insert(adminNotifications)
      .values({
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal',
        icon: computedIcon,
        relatedType: data.relatedType || null,
        relatedId: data.relatedId || null,
        relatedUrl: computedUrl,
        metadata: data.metadata || null,
        expiresAt: data.expiresAt || null,
      })
      .returning()

    return { success: true, notification: notification as Notification }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

/**
 * Get all notifications with optional filters
 */
export async function getNotifications(options?: {
  unreadOnly?: boolean
  limit?: number
  offset?: number
  includeExpired?: boolean
  includeDismissed?: boolean
}): Promise<Notification[]> {
  const conditions = []

  // Filter out dismissed by default
  if (!options?.includeDismissed) {
    conditions.push(eq(adminNotifications.isDismissed, false))
  }

  // Filter unread only
  if (options?.unreadOnly) {
    conditions.push(eq(adminNotifications.isRead, false))
  }

  // Filter expired notifications
  if (!options?.includeExpired) {
    conditions.push(
      or(
        isNull(adminNotifications.expiresAt),
        lt(sql`NOW()`, adminNotifications.expiresAt)
      )
    )
  }

  const notifications = await db
    .select()
    .from(adminNotifications)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminNotifications.createdAt))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0)

  return notifications as Notification[]
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(adminNotifications)
    .where(
      and(
        eq(adminNotifications.isRead, false),
        eq(adminNotifications.isDismissed, false),
        or(
          isNull(adminNotifications.expiresAt),
          lt(sql`NOW()`, adminNotifications.expiresAt)
        )
      )
    )

  return result?.count || 0
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(adminNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(adminNotifications.id, id))

    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const result = await db
      .update(adminNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(adminNotifications.isRead, false))
      .returning()

    revalidatePath('/admin/dashboard')
    return { success: true, count: result.length }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}

/**
 * Dismiss a notification (soft delete)
 */
export async function dismissNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(adminNotifications)
      .set({ isDismissed: true })
      .where(eq(adminNotifications.id, id))

    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to dismiss notification:', error)
    return { success: false, error: 'Failed to dismiss notification' }
  }
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const result = await db
      .update(adminNotifications)
      .set({ isDismissed: true })
      .where(eq(adminNotifications.isDismissed, false))
      .returning()

    revalidatePath('/admin/dashboard')
    return { success: true, count: result.length }
  } catch (error) {
    console.error('Failed to dismiss all notifications:', error)
    return { success: false, error: 'Failed to dismiss all notifications' }
  }
}

/**
 * Delete a notification permanently
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(adminNotifications).where(eq(adminNotifications.id, id))
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

/**
 * Clean up expired notifications (run periodically)
 */
export async function cleanupExpiredNotifications(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const result = await db
      .delete(adminNotifications)
      .where(
        and(
          lt(adminNotifications.expiresAt, sql`NOW()`),
          sql`${adminNotifications.expiresAt} IS NOT NULL`
        )
      )
      .returning()

    return { success: true, count: result.length }
  } catch (error) {
    console.error('Failed to cleanup expired notifications:', error)
    return { success: false, error: 'Failed to cleanup expired notifications' }
  }
}

// ============================================
// HELPER FUNCTIONS FOR CREATING NOTIFICATIONS
// ============================================

/**
 * Create notification for blog post published
 */
export async function notifyBlogPublished(data: {
  postId: string
  title: string
  authorName?: string
}): Promise<void> {
  await createNotification({
    type: 'blog_published',
    title: 'Blog Post Published',
    message: `"${data.title}" has been published${data.authorName ? ` by ${data.authorName}` : ''}.`,
    priority: 'normal',
    relatedType: 'blog_posts',
    relatedId: data.postId,
    metadata: { authorName: data.authorName },
  })
}

/**
 * Create notification for project published
 */
export async function notifyProjectPublished(data: {
  projectId: string
  title: string
  authorName?: string
}): Promise<void> {
  await createNotification({
    type: 'project_published',
    title: 'Project Published',
    message: `"${data.title}" has been published${data.authorName ? ` by ${data.authorName}` : ''}.`,
    priority: 'normal',
    relatedType: 'projects',
    relatedId: data.projectId,
    metadata: { authorName: data.authorName },
  })
}

/**
 * Create notification for form submission
 */
export async function notifyFormSubmission(data: {
  formId: string
  formName: string
  submitterName?: string
  submitterEmail?: string
  submissionId: string
}): Promise<void> {
  const submitter = data.submitterName || data.submitterEmail || 'Anonymous'
  await createNotification({
    type: 'form_submission',
    title: 'New Form Submission',
    message: `${submitter} submitted "${data.formName}".`,
    priority: 'normal',
    relatedType: 'forms',
    relatedId: data.formId,
    relatedUrl: `/admin/dashboard/forms/${data.formId}/responses`,
    metadata: {
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      submissionId: data.submissionId,
    },
  })
}

/**
 * Create notification for contact message
 */
export async function notifyContactMessage(data: {
  messageId: string
  senderName: string
  senderEmail: string
  subject?: string
}): Promise<void> {
  await createNotification({
    type: 'contact_message',
    title: 'New Contact Message',
    message: `${data.senderName} sent a message${data.subject ? `: "${data.subject}"` : ''}.`,
    priority: 'normal',
    relatedType: 'messages',
    relatedId: data.messageId,
    metadata: {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      subject: data.subject,
    },
  })
}

/**
 * Create notification for team member update
 */
export async function notifyTeamUpdate(data: {
  memberId: string
  memberName: string
  action: 'added' | 'updated' | 'removed' | 'position_changed'
  details?: string
}): Promise<void> {
  const actionMessages = {
    added: `${data.memberName} has been added to the team.`,
    updated: `${data.memberName}'s profile has been updated.`,
    removed: `${data.memberName} has been removed from the team.`,
    position_changed: `${data.memberName}'s position has been changed${data.details ? `: ${data.details}` : ''}.`,
  }

  await createNotification({
    type: 'team_update',
    title: 'Team Update',
    message: actionMessages[data.action],
    priority: 'normal',
    relatedType: 'team_members',
    relatedId: data.memberId,
    metadata: { action: data.action, details: data.details },
  })
}

/**
 * Create notification for org chart update (groundwork for M365)
 */
export async function notifyOrgChartUpdate(data: {
  changeType: 'hierarchy' | 'department' | 'sync'
  affectedCount: number
  details?: string
}): Promise<void> {
  const messages = {
    hierarchy: `Organization hierarchy has been updated. ${data.affectedCount} position(s) affected.`,
    department: `Department structure has been updated. ${data.affectedCount} member(s) affected.`,
    sync: `Organization chart synced with Microsoft 365. ${data.affectedCount} change(s) applied.`,
  }

  await createNotification({
    type: 'org_chart_update',
    title: 'Organization Chart Updated',
    message: messages[data.changeType],
    priority: data.changeType === 'sync' ? 'low' : 'normal',
    relatedType: 'team_members',
    metadata: {
      changeType: data.changeType,
      affectedCount: data.affectedCount,
      details: data.details,
    },
  })
}

/**
 * Create notification for donation received (Toyyibpay integration groundwork)
 */
export async function notifyDonationReceived(data: {
  donationId: string
  donorName?: string
  amount: number
  currency?: string
  projectTitle?: string
  paymentReference?: string
}): Promise<void> {
  const donor = data.donorName || 'Anonymous donor'
  const currencySymbol = data.currency === 'MYR' ? 'RM' : data.currency || 'RM'
  const formattedAmount = new Intl.NumberFormat('en-MY').format(data.amount)

  await createNotification({
    type: 'donation_received',
    title: 'Donation Received',
    message: `${donor} donated ${currencySymbol}${formattedAmount}${data.projectTitle ? ` to "${data.projectTitle}"` : ''}.`,
    priority: 'high',
    relatedType: 'donations',
    relatedId: data.donationId,
    metadata: {
      donorName: data.donorName,
      amount: data.amount,
      currency: data.currency,
      projectTitle: data.projectTitle,
      paymentReference: data.paymentReference,
    },
  })
}

/**
 * Create notification for M365 sync events (groundwork)
 */
export async function notifyM365Sync(data: {
  syncType: 'success' | 'partial' | 'failed'
  syncedCount?: number
  failedCount?: number
  errorMessage?: string
}): Promise<void> {
  const messages = {
    success: `Microsoft 365 sync completed successfully. ${data.syncedCount || 0} item(s) synchronized.`,
    partial: `Microsoft 365 sync completed with issues. ${data.syncedCount || 0} synced, ${data.failedCount || 0} failed.`,
    failed: `Microsoft 365 sync failed${data.errorMessage ? `: ${data.errorMessage}` : '.'}`,
  }

  await createNotification({
    type: 'm365_sync',
    title: 'Microsoft 365 Sync',
    message: messages[data.syncType],
    priority: data.syncType === 'failed' ? 'high' : 'low',
    metadata: {
      syncType: data.syncType,
      syncedCount: data.syncedCount,
      failedCount: data.failedCount,
      errorMessage: data.errorMessage,
    },
  })
}

/**
 * Create a system notification
 */
export async function notifySystem(data: {
  title: string
  message: string
  priority?: NotificationPriority
  metadata?: Record<string, unknown>
}): Promise<void> {
  await createNotification({
    type: 'system',
    title: data.title,
    message: data.message,
    priority: data.priority || 'normal',
    metadata: data.metadata,
  })
}
