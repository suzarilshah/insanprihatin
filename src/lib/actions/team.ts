'use server'

import { revalidatePath } from 'next/cache'
import { db, teamMembers } from '@/db'
import { eq, asc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'

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
  await requireAuth()

  const member = await db.insert(teamMembers).values({
    ...data,
    isActive: true,
  }).returning()

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
  await requireAuth()

  await db
    .update(teamMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(teamMembers.id, id))

  revalidatePath('/about')
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  await requireAuth()

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
