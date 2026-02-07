'use server'

import { revalidatePath } from 'next/cache'
import { db, translationGlossary } from '@/db'
import { eq, asc, and, ilike, or } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'
import { logActivity } from '@/lib/versioning'

export interface GlossaryTerm {
  id: string
  termEn: string
  termMs: string
  context: string | null
  notes: string | null
  caseSensitive: boolean | null
  isActive: boolean | null
  createdBy: string | null
  createdByEmail: string | null
  createdAt: Date
  updatedAt: Date
}

// Pre-defined NGO-specific glossary terms
export const NGO_GLOSSARY_TERMS = [
  { termEn: 'Foundation', termMs: 'Yayasan', context: 'general' },
  { termEn: 'Beneficiary', termMs: 'Penerima Manfaat', context: 'project' },
  { termEn: 'Beneficiaries', termMs: 'Penerima Manfaat', context: 'project' },
  { termEn: 'Donation', termMs: 'Derma', context: 'donation' },
  { termEn: 'Donate', termMs: 'Derma', context: 'donation' },
  { termEn: 'Contribution', termMs: 'Sumbangan', context: 'donation' },
  { termEn: 'Impact', termMs: 'Impak', context: 'general' },
  { termEn: 'Volunteer', termMs: 'Sukarelawan', context: 'general' },
  { termEn: 'Volunteers', termMs: 'Sukarelawan', context: 'general' },
  { termEn: 'Community', termMs: 'Komuniti', context: 'general' },
  { termEn: 'Communities', termMs: 'Komuniti', context: 'general' },
  { termEn: 'Sustainable', termMs: 'Mampan', context: 'general' },
  { termEn: 'Sustainability', termMs: 'Kemampanan', context: 'general' },
  { termEn: 'Empowerment', termMs: 'Pemerkasaan', context: 'general' },
  { termEn: 'Empower', termMs: 'Memperkasa', context: 'general' },
  { termEn: 'Outreach', termMs: 'Jangkauan', context: 'project' },
  { termEn: 'Healthcare', termMs: 'Penjagaan Kesihatan', context: 'project' },
  { termEn: 'Health', termMs: 'Kesihatan', context: 'project' },
  { termEn: 'Education', termMs: 'Pendidikan', context: 'project' },
  { termEn: 'Transparency', termMs: 'Ketelusan', context: 'donation' },
  { termEn: 'Accountability', termMs: 'Akauntabiliti', context: 'general' },
  { termEn: 'Trustee', termMs: 'Pemegang Amanah', context: 'about' },
  { termEn: 'Trustees', termMs: 'Pemegang Amanah', context: 'about' },
  { termEn: 'Board of Directors', termMs: 'Lembaga Pengarah', context: 'about' },
  { termEn: 'Board of Trustees', termMs: 'Lembaga Pemegang Amanah', context: 'about' },
  { termEn: 'Annual Report', termMs: 'Laporan Tahunan', context: 'about' },
  { termEn: 'Mission', termMs: 'Misi', context: 'about' },
  { termEn: 'Vision', termMs: 'Visi', context: 'about' },
  { termEn: 'Core Values', termMs: 'Nilai Teras', context: 'about' },
  { termEn: 'Initiative', termMs: 'Inisiatif', context: 'project' },
  { termEn: 'Initiatives', termMs: 'Inisiatif', context: 'project' },
  { termEn: 'Program', termMs: 'Program', context: 'project' },
  { termEn: 'Programs', termMs: 'Program', context: 'project' },
  { termEn: 'Charity', termMs: 'Amal', context: 'general' },
  { termEn: 'Charitable', termMs: 'Kebajikan', context: 'general' },
  { termEn: 'Welfare', termMs: 'Kebajikan', context: 'general' },
  { termEn: 'Underprivileged', termMs: 'Kurang Bernasib Baik', context: 'general' },
  { termEn: 'Underserved', termMs: 'Kurang Mendapat Perkhidmatan', context: 'general' },
  { termEn: 'Aid', termMs: 'Bantuan', context: 'project' },
  { termEn: 'Assistance', termMs: 'Bantuan', context: 'project' },
  { termEn: 'Support', termMs: 'Sokongan', context: 'general' },
  { termEn: 'Partnership', termMs: 'Perkongsian', context: 'general' },
  { termEn: 'Partner', termMs: 'Rakan Kongsi', context: 'general' },
  { termEn: 'Stakeholder', termMs: 'Pemegang Kepentingan', context: 'general' },
  { termEn: 'Stakeholders', termMs: 'Pemegang Kepentingan', context: 'general' },
  { termEn: 'Advocacy', termMs: 'Advokasi', context: 'general' },
  { termEn: 'Fundraising', termMs: 'Pengumpulan Dana', context: 'donation' },
  { termEn: 'Grant', termMs: 'Geran', context: 'donation' },
  { termEn: 'Grants', termMs: 'Geran', context: 'donation' },
]

/**
 * Get all glossary terms
 */
export async function getGlossaryTerms(options?: {
  context?: string
  activeOnly?: boolean
  search?: string
}): Promise<GlossaryTerm[]> {
  const conditions = []

  if (options?.activeOnly !== false) {
    conditions.push(eq(translationGlossary.isActive, true))
  }

  if (options?.context) {
    conditions.push(eq(translationGlossary.context, options.context))
  }

  if (options?.search) {
    conditions.push(
      or(
        ilike(translationGlossary.termEn, `%${options.search}%`),
        ilike(translationGlossary.termMs, `%${options.search}%`)
      )
    )
  }

  return db.query.translationGlossary.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [asc(translationGlossary.termEn)],
  })
}

/**
 * Get a single glossary term
 */
export async function getGlossaryTerm(id: string): Promise<GlossaryTerm | null> {
  const term = await db.query.translationGlossary.findFirst({
    where: eq(translationGlossary.id, id),
  })
  return term || null
}

/**
 * Create a new glossary term
 */
export async function createGlossaryTerm(data: {
  termEn: string
  termMs: string
  context?: string
  notes?: string
  caseSensitive?: boolean
}) {
  const user = await requireAuth()

  // Check if term already exists
  const existing = await db.query.translationGlossary.findFirst({
    where: ilike(translationGlossary.termEn, data.termEn),
  })

  if (existing) {
    return { success: false, error: 'Term already exists in glossary' }
  }

  const [term] = await db.insert(translationGlossary).values({
    termEn: data.termEn,
    termMs: data.termMs,
    context: data.context,
    notes: data.notes,
    caseSensitive: data.caseSensitive ?? false,
    isActive: true,
    createdBy: user.id,
    createdByEmail: user.email,
  }).returning()

  // Log activity
  await logActivity('glossary_create', `Added glossary term: ${data.termEn} = ${data.termMs}`, {
    contentTitle: data.termEn,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { glossaryId: term.id },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true, term }
}

/**
 * Update a glossary term
 */
export async function updateGlossaryTerm(id: string, data: {
  termEn?: string
  termMs?: string
  context?: string
  notes?: string
  caseSensitive?: boolean
  isActive?: boolean
}) {
  const user = await requireAuth()

  const existing = await db.query.translationGlossary.findFirst({
    where: eq(translationGlossary.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Term not found' }
  }

  await db
    .update(translationGlossary)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(translationGlossary.id, id))

  // Log activity
  await logActivity('glossary_update', `Updated glossary term: ${existing.termEn}`, {
    contentTitle: existing.termEn,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { glossaryId: id },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true }
}

/**
 * Delete a glossary term
 */
export async function deleteGlossaryTerm(id: string) {
  const user = await requireAuth()

  const existing = await db.query.translationGlossary.findFirst({
    where: eq(translationGlossary.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Term not found' }
  }

  await db.delete(translationGlossary).where(eq(translationGlossary.id, id))

  // Log activity
  await logActivity('glossary_delete', `Deleted glossary term: ${existing.termEn}`, {
    contentTitle: existing.termEn,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { glossaryId: id },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true }
}

/**
 * Seed the glossary with NGO-specific terms
 * Only adds terms that don't already exist
 */
export async function seedGlossary() {
  const user = await requireAuth()

  let added = 0
  let skipped = 0

  for (const term of NGO_GLOSSARY_TERMS) {
    // Check if term already exists
    const existing = await db.query.translationGlossary.findFirst({
      where: ilike(translationGlossary.termEn, term.termEn),
    })

    if (existing) {
      skipped++
      continue
    }

    await db.insert(translationGlossary).values({
      termEn: term.termEn,
      termMs: term.termMs,
      context: term.context,
      isActive: true,
      createdBy: user.id,
      createdByEmail: user.email,
    })
    added++
  }

  // Log activity
  await logActivity('glossary_seed', `Seeded glossary with ${added} NGO terms`, {
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { added, skipped },
  })

  revalidatePath('/admin/dashboard/translations')
  return { success: true, added, skipped }
}

/**
 * Apply glossary terms to a text
 * This replaces English terms with their Malay equivalents (or vice versa)
 */
export async function applyGlossaryToText(
  text: string,
  targetLanguage: 'en' | 'ms'
): Promise<string> {
  if (!text) return text

  const terms = await getGlossaryTerms({ activeOnly: true })

  let result = text

  for (const term of terms) {
    const sourceField = targetLanguage === 'ms' ? 'termEn' : 'termMs'
    const targetField = targetLanguage === 'ms' ? 'termMs' : 'termEn'

    const sourceTerm = term[sourceField]
    const targetTerm = term[targetField]

    if (!sourceTerm || !targetTerm) continue

    // Create regex based on case sensitivity
    const flags = term.caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(`\\b${escapeRegex(sourceTerm)}\\b`, flags)

    result = result.replace(regex, targetTerm)
  }

  return result
}

/**
 * Get glossary statistics
 */
export async function getGlossaryStats() {
  const terms = await db.query.translationGlossary.findMany()

  const stats = {
    total: terms.length,
    active: terms.filter(t => t.isActive).length,
    inactive: terms.filter(t => !t.isActive).length,
    byContext: {} as Record<string, number>,
  }

  terms.forEach(t => {
    const ctx = t.context || 'general'
    stats.byContext[ctx] = (stats.byContext[ctx] || 0) + 1
  })

  return stats
}

// Helper to escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
