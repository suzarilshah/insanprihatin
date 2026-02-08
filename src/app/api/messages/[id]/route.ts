import { NextRequest, NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Require admin authentication with group membership verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    await db
      .update(contactSubmissions)
      .set({ isRead: body.isRead })
      .where(eq(contactSubmissions.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Require admin authentication with group membership verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
