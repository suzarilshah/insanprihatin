import { NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'
import { desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/server'

export async function GET() {
  // SECURITY: Require admin authentication with group membership verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const messages = await db.query.contactSubmissions.findMany({
      orderBy: [desc(contactSubmissions.createdAt)],
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to get messages:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}
