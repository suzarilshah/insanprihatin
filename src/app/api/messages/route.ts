import { NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'
import { desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/server'

export async function GET() {
  try {
    // Verify authentication - only admins can view messages
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await db.query.contactSubmissions.findMany({
      orderBy: [desc(contactSubmissions.createdAt)],
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to get messages:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}
