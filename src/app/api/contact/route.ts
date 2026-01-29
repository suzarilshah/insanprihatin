import { NextRequest, NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Save to database
    const submission = await db.insert(contactSubmissions).values({
      name,
      email,
      phone: phone || null,
      subject: subject || 'General Inquiry',
      message,
    }).returning()

    // TODO: Send email notification to admin
    // await sendContactNotificationEmail(submission[0])

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
      id: submission[0].id,
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    )
  }
}
