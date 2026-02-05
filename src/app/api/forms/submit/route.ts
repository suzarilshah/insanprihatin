import { NextRequest, NextResponse } from 'next/server'
import { createFormSubmission, getFormBySlug, FormField } from '@/lib/actions/forms'
import { sendFormNotificationEmail } from '@/lib/email'
import { notifyFormSubmission } from '@/lib/actions/notifications'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string from LocalizedString
const getTitle = (title: LocalizedString | string | null | undefined): string => {
  if (!title) return ''
  if (typeof title === 'string') return title
  return getLocalizedValue(title, 'en')
}

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

    if (!result.success || !result.submission) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Create admin notification for new form submission
    try {
      await notifyFormSubmission({
        formId,
        formName: form.name,
        submitterName,
        submitterEmail,
        submissionId: result.submission.id,
      })
    } catch (notifyError) {
      console.error('Failed to create form submission notification:', notifyError)
      // Don't fail the submission if notification fails
    }

    // Send email notification if enabled
    if (form.sendEmailNotification) {
      try {
        await sendFormNotificationEmail({
          formName: form.name,
          formTitle: getTitle(form.title) || form.name,
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
