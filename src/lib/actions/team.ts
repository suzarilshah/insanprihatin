'use server'

import { revalidatePath } from 'next/cache'
import { db, teamMembers } from '@/db'
import { eq, asc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-server'
import { createVersion, logActivity } from '@/lib/versioning'
import { notifyTeamUpdate, notifyOrgChartUpdate } from '@/lib/actions/notifications'

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
  position: string
  department?: string
  bio?: string
  image?: string
  email?: string
  phone?: string
  linkedin?: string
  sortOrder?: number
  parentId?: string
}) {
  const user = await requireAuth()

  const member = await db.insert(teamMembers).values({
    ...data,
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
    details: data.position,
  })

  revalidatePath('/about')
  return { success: true, member: member[0] }
}

export async function updateTeamMember(id: string, data: {
  name?: string
  position?: string
  department?: string
  bio?: string
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

  await db
    .update(teamMembers)
    .set({ ...data, updatedAt: new Date() })
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
  const positionChanged = data.position && data.position !== existing.position
  const parentChanged = data.parentId !== undefined && data.parentId !== existing.parentId

  if (positionChanged) {
    await notifyTeamUpdate({
      memberId: id,
      memberName: data.name || existing.name,
      action: 'position_changed',
      details: `${existing.position} → ${data.position}`,
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
