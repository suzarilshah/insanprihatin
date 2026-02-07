'use server'

import { revalidatePath } from 'next/cache'
import { db, translationFeedback } from '@/db'
import { eq, desc, and, or } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { logActivity } from '@/lib/versioning'

export type FeedbackType = 'incorrect' | 'awkward' | 'context_missing' | 'grammar'
export type FeedbackStatus = 'pending' | 'reviewed' | 'applied' | 'dismissed'

export interface TranslationFeedbackItem {
  id: string
  contentType: string
  contentId: string
  field: string
  sourceLanguage: string
  targetLanguage: string
  originalText: string
  translatedText: string
  correctedText: string | null
  feedbackType: string
  notes: string | null
  status: string | null
  submittedBy: string | null
  submittedByEmail: string | null
  submittedByName: string | null
  reviewedBy: string | null
  reviewedByEmail: string | null
  createdAt: Date
  reviewedAt: Date | null
}

/**
 * Get all translation feedback items
 */
export async function getTranslationFeedback(options?: {
  status?: FeedbackStatus
  contentType?: string
  limit?: number
}): Promise<TranslationFeedbackItem[]> {
  const conditions = []

  if (options?.status) {
    conditions.push(eq(translationFeedback.status, options.status))
  }

  if (options?.contentType) {
    conditions.push(eq(translationFeedback.contentType, options.contentType))
  }

  const items = await db.query.translationFeedback.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(translationFeedback.createdAt)],
    limit: options?.limit,
  })

  return items
}

/**
 * Get translation feedback for a specific content item
 */
export async function getContentFeedback(
  contentType: string,
  contentId: string
): Promise<TranslationFeedbackItem[]> {
  return db.query.translationFeedback.findMany({
    where: and(
      eq(translationFeedback.contentType, contentType),
      eq(translationFeedback.contentId, contentId)
    ),
    orderBy: [desc(translationFeedback.createdAt)],
  })
}

/**
 * Submit translation feedback
 */
export async function submitTranslationFeedback(data: {
  contentType: string
  contentId: string
  field: string
  sourceLanguage: 'en' | 'ms'
  targetLanguage: 'en' | 'ms'
  originalText: string
  translatedText: string
  correctedText?: string
  feedbackType: FeedbackType
  notes?: string
}) {
  const user = await requireAuth()

  // Create the feedback entry
  const [feedback] = await db.insert(translationFeedback).values({
    contentType: data.contentType,
    contentId: data.contentId,
    field: data.field,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
    originalText: data.originalText,
    translatedText: data.translatedText,
    correctedText: data.correctedText,
    feedbackType: data.feedbackType,
    notes: data.notes,
    status: 'pending',
    submittedBy: user.id,
    submittedByEmail: user.email,
    submittedByName: user.name,
  }).returning()

  // Log activity
  await logActivity('translation_feedback', `Submitted translation feedback for ${data.contentType}`, {
    contentTitle: `${data.field} translation`,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: {
      feedbackId: feedback.id,
      feedbackType: data.feedbackType,
      field: data.field,
      contentType: data.contentType,
      contentId: data.contentId,
    },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true, feedback }
}

/**
 * Review translation feedback
 */
export async function reviewTranslationFeedback(
  feedbackId: string,
  data: {
    status: 'reviewed' | 'applied' | 'dismissed'
    correctedText?: string
  }
) {
  const user = await requireAuth()

  const existing = await db.query.translationFeedback.findFirst({
    where: eq(translationFeedback.id, feedbackId),
  })

  if (!existing) {
    return { success: false, error: 'Feedback not found' }
  }

  // Update the feedback
  await db
    .update(translationFeedback)
    .set({
      status: data.status,
      correctedText: data.correctedText ?? existing.correctedText,
      reviewedBy: user.id,
      reviewedByEmail: user.email,
      reviewedAt: new Date(),
    })
    .where(eq(translationFeedback.id, feedbackId))

  // Log activity
  await logActivity('translation_review', `Reviewed translation feedback: ${data.status}`, {
    contentTitle: `${existing.field} translation`,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: {
      feedbackId,
      status: data.status,
      contentType: existing.contentType,
      contentId: existing.contentId,
    },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true }
}

/**
 * Get feedback statistics
 */
export async function getTranslationFeedbackStats() {
  const allFeedback = await db.query.translationFeedback.findMany()

  const stats = {
    total: allFeedback.length,
    pending: allFeedback.filter(f => f.status === 'pending').length,
    reviewed: allFeedback.filter(f => f.status === 'reviewed').length,
    applied: allFeedback.filter(f => f.status === 'applied').length,
    dismissed: allFeedback.filter(f => f.status === 'dismissed').length,
    byType: {
      incorrect: allFeedback.filter(f => f.feedbackType === 'incorrect').length,
      awkward: allFeedback.filter(f => f.feedbackType === 'awkward').length,
      context_missing: allFeedback.filter(f => f.feedbackType === 'context_missing').length,
      grammar: allFeedback.filter(f => f.feedbackType === 'grammar').length,
    },
    byContentType: {} as Record<string, number>,
  }

  // Group by content type
  allFeedback.forEach(f => {
    stats.byContentType[f.contentType] = (stats.byContentType[f.contentType] || 0) + 1
  })

  return stats
}

/**
 * Delete translation feedback
 */
export async function deleteTranslationFeedback(feedbackId: string) {
  const user = await requireAuth()

  const existing = await db.query.translationFeedback.findFirst({
    where: eq(translationFeedback.id, feedbackId),
  })

  if (!existing) {
    return { success: false, error: 'Feedback not found' }
  }

  await db.delete(translationFeedback).where(eq(translationFeedback.id, feedbackId))

  // Log activity
  await logActivity('translation_feedback_delete', `Deleted translation feedback`, {
    user: { id: user.id, email: user.email, name: user.name },
    metadata: {
      contentType: existing.contentType,
      contentId: existing.contentId,
    },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true }
}
