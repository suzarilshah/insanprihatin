import { NextRequest, NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/db'
import { sendContactNotificationEmail } from '@/lib/email'
import { notifyContactMessage } from '@/lib/actions/notifications'
import { RateLimiters } from '@/lib/api-rate-limit'

export async function POST(request: NextRequest) {
  // SECURITY: Rate limit contact form submissions to prevent spam
  const rateLimitResponse = RateLimiters.contactForm(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 255),
      phone: phone ? phone.trim().slice(0, 20) : null,
      subject: subject?.trim().slice(0, 50) || 'General Inquiry',
      message: message.trim().slice(0, 5000),
    }

    // Save to database
    const [submission] = await db.insert(contactSubmissions).values({
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
    }).returning()

    // Create admin notification for new contact message
    try {
      await notifyContactMessage({
        messageId: submission.id,
        senderName: sanitizedData.name,
        senderEmail: sanitizedData.email,
        subject: sanitizedData.subject,
      })
    } catch (notifyError) {
      console.error('Failed to create contact notification:', notifyError)
      // Don't fail the request if notification fails
    }

    // Send email notification (don't fail the request if email fails)
    try {
      const emailResult = await sendContactNotificationEmail({
        id: submission.id,
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
      })

      if (!emailResult.success) {
        console.log('Email notification not sent:', emailResult.reason || emailResult.error)
      }
    } catch (emailError) {
      // Log but don't fail the request
      console.error('Email notification error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
      id: submission.id,
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    )
  }
}
