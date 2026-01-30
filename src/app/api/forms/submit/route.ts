import { NextRequest, NextResponse } from 'next/server'
import { createFormSubmission, getFormBySlug, FormField } from '@/lib/actions/forms'
import { sendFormNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      formId,
      formSlug,
      data,
      sourceUrl,
      sourceContentType,
      sourceContentId,
      sourceContentTitle,
    } = body

    if (!formId || !formSlug || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get form to validate and get email settings
    const form = await getFormBySlug(formSlug)
    if (!form || !form.isActive) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      )
    }

    // Validate required fields
    const fields = form.fields as unknown as FormField[]
    for (const field of fields) {
      if (field.required && !data[field.id]) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        )
      }
    }

    // Extract email and name from submission data for tracking
    let submitterEmail: string | undefined
    let submitterName: string | undefined

    for (const field of fields) {
      if (field.type === 'email' && data[field.id]) {
        submitterEmail = data[field.id] as string
      }
      if (field.label.toLowerCase().includes('name') && data[field.id]) {
        submitterName = data[field.id] as string
      }
    }

    // Create submission
    const result = await createFormSubmission({
      formId,
      formSlug,
      data,
      sourceUrl,
      sourceContentType,
      sourceContentId,
      sourceContentTitle,
      submitterEmail,
      submitterName,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Send email notification if enabled
    if (form.sendEmailNotification) {
      try {
        await sendFormNotificationEmail({
          formName: form.name,
          formTitle: form.title || form.name,
          fields: fields,
          data,
          sourceUrl,
          sourceContentTitle,
          notificationEmail: form.notificationEmail || undefined,
        })
      } catch (emailError) {
        console.error('Failed to send form notification email:', emailError)
        // Don't fail the submission if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
