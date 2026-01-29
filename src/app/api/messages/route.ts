import { NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'
import { desc } from 'drizzle-orm'

export async function GET() {
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
