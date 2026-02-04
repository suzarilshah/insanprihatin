'use server'

import { revalidatePath } from 'next/cache'
import { db, teamMembers } from '@/db'
import { eq, asc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyTeamUpdate, notifyOrgChartUpdate } from '@/lib/actions/notifications'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

type LocalizedField = LocalizedString | string

// Helper to get string value from LocalizedString (for logging/notifications)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

// Helper to convert string to LocalizedString (for database insertion)
const toLocalized = (value: LocalizedField | null | undefined): LocalizedString | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return { en: value, ms: value }
  return value
}

// Helper for required LocalizedString fields
const toLocalizedRequired = (value: LocalizedField): LocalizedString => {
  if (typeof value === 'string') return { en: value, ms: value }
  return value
}

export async function getTeamMembers(options?: { department?: string; active?: boolean }) {
  const conditions = []

  if (options?.active !== undefined) {
    conditions.push(eq(teamMembers.isActive, options.active))
  }

  if (options?.department) {
    conditions.push(eq(teamMembers.department, options.department))
  }

  const members = await db.query.teamMembers.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [asc(teamMembers.sortOrder), asc(teamMembers.name)],
  })

  return members
}

export async function getTeamMember(id: string) {
  const member = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
  })
  return member
}

export async function createTeamMember(data: {
  name: string
  position: LocalizedField
  department?: string
  bio?: LocalizedField
  image?: string
  email?: string
  phone?: string
  linkedin?: string
  sortOrder?: number
  parentId?: string
}) {
  const user = await requireAuth()

  const member = await db.insert(teamMembers).values({
    name: data.name,
    position: toLocalizedRequired(data.position),
    department: data.department,
    bio: toLocalized(data.bio),
    image: data.image,
    email: data.email,
    phone: data.phone,
    linkedin: data.linkedin,
    sortOrder: data.sortOrder,
    parentId: data.parentId,
    isActive: true,
  }).returning()

  // Create version record
  await createVersion(
    'team_members',
    member[0].id,
    member[0] as Record<string, unknown>,
    'create',
    { id: user.id, email: user.email, name: user.name }
  )

  // Log activity
  await logActivity('content_create', `Created team member: ${data.name}`, {
    contentType: 'team_members',
    contentId: member[0].id,
    contentTitle: data.name,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification for team member added
  await notifyTeamUpdate({
    memberId: member[0].id,
    memberName: data.name,
    action: 'added',
    details: l(data.position),
  })

  revalidatePath('/about')
  return { success: true, member: member[0] }
}

export async function updateTeamMember(id: string, data: {
  name?: string
  position?: LocalizedField
  department?: string
  bio?: LocalizedField
  image?: string
  email?: string
  phone?: string
  linkedin?: string
  sortOrder?: number
  parentId?: string
  isActive?: boolean
}) {
  const user = await requireAuth()

  // Get existing data for version comparison
  const existing = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Team member not found' }
  }

  // Build update data with LocalizedString conversion
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.position !== undefined && { position: toLocalizedRequired(data.position) }),
    ...(data.department !== undefined && { department: data.department }),
    ...(data.bio !== undefined && { bio: toLocalized(data.bio) }),
    ...(data.image !== undefined && { image: data.image }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    ...(data.parentId !== undefined && { parentId: data.parentId }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  }

  await db
    .update(teamMembers)
    .set(updateData)
    .where(eq(teamMembers.id, id))

  // Get updated data
  const updated = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
  })

  // Create version record
  await createVersion(
    'team_members',
    id,
    updated as Record<string, unknown>,
    'update',
    { id: user.id, email: user.email, name: user.name },
    { previousData: existing as Record<string, unknown> }
  )

  // Log activity
  await logActivity('content_update', `Updated team member: ${existing.name}`, {
    contentType: 'team_members',
    contentId: id,
    contentTitle: existing.name,
    user: { id: user.id, email: user.email, name: user.name },
  })

  // Create notification for team member update
  const positionChanged = data.position && l(data.position) !== l(existing.position)
  const parentChanged = data.parentId !== undefined && data.parentId !== existing.parentId

  if (positionChanged) {
    await notifyTeamUpdate({
      memberId: id,
      memberName: data.name || existing.name,
      action: 'position_changed',
      details: `${l(existing.position)} → ${l(data.position)}`,
    })
  } else if (parentChanged) {
    await notifyOrgChartUpdate({
      changeType: 'hierarchy',
      affectedCount: 1,
      details: `${existing.name}'s reporting structure updated`,
    })
  } else {
    await notifyTeamUpdate({
      memberId: id,
      memberName: data.name || existing.name,
      action: 'updated',
    })
  }

  revalidatePath('/about')
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  const user = await requireAuth()

  // Get existing data before deletion
  const existing = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
  })

  if (!existing) {
    return { success: false, error: 'Team member not found' }
  }

  // Create version record BEFORE deletion
  await createVersion(
    'team_members',
    id,
    existing as Record<string, unknown>,
    'delete',
    { id: user.id, email: user.email, name: user.name },
    { customSummary: `Deleted team member: ${existing.name}` }
  )

  // Log activity
  await logActivity('content_delete', `Deleted team member: ${existing.name}`, {
    contentType: 'team_members',
    contentId: id,
    contentTitle: existing.name,
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { deletedData: existing },
  })

  // Create notification for team member removed
  await notifyTeamUpdate({
    memberId: id,
    memberName: existing.name,
    action: 'removed',
  })

  await db.delete(teamMembers).where(eq(teamMembers.id, id))

  revalidatePath('/about')
  return { success: true }
}

export async function getDepartments() {
  const members = await db.query.teamMembers.findMany({
    columns: { department: true },
  })

  const departments = [...new Set(members.map((m) => m.department).filter(Boolean))]
  return departments
}

// Get team members in hierarchical structure
export async function getTeamHierarchy() {
  const members = await db.query.teamMembers.findMany({
    where: eq(teamMembers.isActive, true),
    orderBy: [asc(teamMembers.sortOrder), asc(teamMembers.name)],
  })

  return members
}

// Get direct reports of a team member
export async function getDirectReports(parentId: string) {
  const reports = await db.query.teamMembers.findMany({
    where: and(
      eq(teamMembers.parentId, parentId),
      eq(teamMembers.isActive, true)
    ),
    orderBy: [asc(teamMembers.sortOrder), asc(teamMembers.name)],
  })

  return reports
}

// Get all potential parent members (for dropdown in admin)
export async function getPotentialParents(excludeId?: string) {
  const conditions = [eq(teamMembers.isActive, true)]

  // If excluding a member (e.g., when editing), also exclude that member's descendants
  // to prevent circular references

  const members = await db.query.teamMembers.findMany({
    where: and(...conditions),
    orderBy: [asc(teamMembers.department), asc(teamMembers.sortOrder), asc(teamMembers.name)],
  })

  // If we have an excludeId, filter out the member and their descendants
  if (excludeId) {
    const getDescendantIds = (parentId: string): string[] => {
      const children = members.filter(m => m.parentId === parentId)
      return [parentId, ...children.flatMap(c => getDescendantIds(c.id))]
    }
    const excludeIds = getDescendantIds(excludeId)
    return members.filter(m => !excludeIds.includes(m.id))
  }

  return members
}

// Initialize official team members from Trust Deed (Surat Ikatan Amanah)
// This function clears existing team members and adds the real organizational structure
export async function initializeOfficialTeam() {
  const user = await requireAuth()

  // Clear existing team members
  await db.delete(teamMembers)

  // Generate UUIDs for parent relationships
  const crypto = await import('crypto')
  const founderAdlyId = crypto.randomUUID()
  const founderAshrafId = crypto.randomUUID()
  const chairmanMariamId = crypto.randomUUID()
  const financeDirectorSheikKhuzaifahId = crypto.randomUUID()
  const communicationsHeadAmmarId = crypto.randomUUID()
  const headOfItSuzarilId = crypto.randomUUID()

  // Real team members from Trust Deed (Surat Ikatan Amanah)
  const officialTeam = [
    // Founders (Board of Directors level)
    {
      id: founderAdlyId,
      name: 'Adly bin Zahari',
      position: { en: 'Founder', ms: 'Pengasas' },
      department: 'Board of Directors',
      bio: {
        en: 'Co-founder of Yayasan Insan Prihatin, dedicated to community welfare and sustainable development.',
        ms: 'Pengasas bersama Yayasan Insan Prihatin, berdedikasi kepada kebajikan komuniti dan pembangunan mampan.'
      },
      sortOrder: 1,
      hierarchyLevel: 0,
      parentId: null,
      isActive: true,
    },
    {
      id: founderAshrafId,
      name: 'Ashraf Mukhlis bin Minghat',
      position: { en: 'Founder', ms: 'Pengasas' },
      department: 'Board of Directors',
      bio: {
        en: 'Co-founder of Yayasan Insan Prihatin, committed to education and social development.',
        ms: 'Pengasas bersama Yayasan Insan Prihatin, komited kepada pendidikan dan pembangunan sosial.'
      },
      sortOrder: 2,
      hierarchyLevel: 0,
      parentId: null,
      isActive: true,
    },

    // Board of Trustees
    {
      id: chairmanMariamId,
      name: 'Mariam binti Ilias',
      position: { en: 'Chairman', ms: 'Pengerusi' },
      department: 'Board of Trustees',
      bio: {
        en: 'Chairman of the Board of Trustees, overseeing governance and strategic direction of the foundation.',
        ms: 'Pengerusi Lembaga Pemegang Amanah, menyelia tadbir urus dan hala tuju strategik yayasan.'
      },
      sortOrder: 3,
      hierarchyLevel: 1,
      parentId: founderAdlyId,
      isActive: true,
    },
    {
      id: financeDirectorSheikKhuzaifahId,
      name: 'Sheikh Khuzaifah bin Sheik Abu Bakar',
      position: { en: 'Finance Director', ms: 'Pengarah Kewangan' },
      department: 'Board of Trustees',
      bio: {
        en: 'Finance Director responsible for financial oversight and compliance.',
        ms: 'Pengarah Kewangan bertanggungjawab untuk pengawasan dan pematuhan kewangan.'
      },
      sortOrder: 4,
      hierarchyLevel: 1,
      parentId: chairmanMariamId,
      isActive: true,
    },
    {
      id: communicationsHeadAmmarId,
      name: 'Mohamad Ammar bin Atan',
      position: { en: 'Head of Corporate Communication', ms: 'Ketua Komunikasi Korporat' },
      department: 'Board of Trustees',
      bio: {
        en: 'Head of Corporate Communication, managing public relations and organizational communications.',
        ms: 'Ketua Komunikasi Korporat, menguruskan perhubungan awam dan komunikasi organisasi.'
      },
      sortOrder: 5,
      hierarchyLevel: 1,
      parentId: chairmanMariamId,
      isActive: true,
    },

    // Finance Department
    {
      id: crypto.randomUUID(),
      name: 'Ainul Khairiyah binti Asrul Affendi',
      position: { en: 'Accountant', ms: 'Akauntan' },
      department: 'Finance',
      bio: {
        en: 'Accountant managing financial records and reporting.',
        ms: 'Akauntan menguruskan rekod kewangan dan pelaporan.'
      },
      sortOrder: 6,
      hierarchyLevel: 2,
      parentId: financeDirectorSheikKhuzaifahId,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'Afifah',
      position: { en: 'Finance Officer', ms: 'Pegawai Kewangan' },
      department: 'Finance',
      bio: {
        en: 'Finance Officer supporting financial operations.',
        ms: 'Pegawai Kewangan menyokong operasi kewangan.'
      },
      sortOrder: 7,
      hierarchyLevel: 2,
      parentId: financeDirectorSheikKhuzaifahId,
      isActive: true,
    },

    // IT Department
    {
      id: headOfItSuzarilId,
      name: 'Ts. Suzaril Shah',
      position: { en: 'Head of IT', ms: 'Ketua IT' },
      department: 'Information Technology',
      bio: {
        en: 'Head of IT, leading technology initiatives and digital transformation.',
        ms: 'Ketua IT, memimpin inisiatif teknologi dan transformasi digital.'
      },
      sortOrder: 8,
      hierarchyLevel: 2,
      parentId: chairmanMariamId,
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'Aizat',
      position: { en: 'IT Officer', ms: 'Pegawai IT' },
      department: 'Information Technology',
      bio: {
        en: 'IT Officer supporting technology operations and systems.',
        ms: 'Pegawai IT menyokong operasi dan sistem teknologi.'
      },
      sortOrder: 9,
      hierarchyLevel: 3,
      parentId: headOfItSuzarilId,
      isActive: true,
    },

    // Admin Office
    {
      id: crypto.randomUUID(),
      name: 'Firah',
      position: { en: 'Admin Officer', ms: 'Pegawai Pentadbiran' },
      department: 'Administration',
      bio: {
        en: 'Admin Officer managing office operations and administrative tasks.',
        ms: 'Pegawai Pentadbiran menguruskan operasi pejabat dan tugas pentadbiran.'
      },
      sortOrder: 10,
      hierarchyLevel: 2,
      parentId: chairmanMariamId,
      isActive: true,
    },
  ]

  // Insert all team members
  for (const member of officialTeam) {
    await db.insert(teamMembers).values(member)
  }

  // Log activity
  await logActivity('system_update', 'Initialized official team structure from Trust Deed', {
    user: { id: user.id, email: user.email, name: user.name },
    metadata: { teamCount: officialTeam.length },
  })

  // Create notification
  await notifyOrgChartUpdate({
    changeType: 'hierarchy',
    affectedCount: officialTeam.length,
    details: 'Official organizational structure initialized from Trust Deed',
  })

  revalidatePath('/about')
  revalidatePath('/admin/dashboard/team')

  return { success: true, count: officialTeam.length }
}
