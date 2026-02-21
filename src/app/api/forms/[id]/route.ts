import { NextRequest, NextResponse } from 'next/server'
import { getForm, updateForm, deleteForm, FormField, getFormWithDetails } from '@/lib/actions/forms'
import { requireAuth } from '@/lib/auth/server'
import { enforceTrustedOrigin } from '@/lib/security/request'

interface RouteContext {
  params: Promise<{ id: string }>
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_FIELD_TYPES = new Set(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'number'])

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
}

function validateFields(fields: unknown): fields is FormField[] {
  if (!Array.isArray(fields)) return false
  if (fields.length > 50) return false

  return fields.every((field) => {
    if (!field || typeof field !== 'object') return false
    const typed = field as Partial<FormField>
    if (!typed.id || typeof typed.id !== 'string' || typed.id.length > 64) return false
    if (!typed.type || !VALID_FIELD_TYPES.has(typed.type)) return false
    if (!typed.label || typeof typed.label !== 'string' || typed.label.length > 120) return false
    if (typed.placeholder && (typeof typed.placeholder !== 'string' || typed.placeholder.length > 200)) return false
    if (typed.options && (!Array.isArray(typed.options) || typed.options.length > 100)) return false
    return true
  })
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  // SECURITY: Require admin authentication for viewing form details
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const searchParams = request.nextUrl.searchParams
    const withSubmissions = searchParams.get('withSubmissions') === 'true'

    if (withSubmissions) {
      const formWithDetails = await getFormWithDetails(id)
      if (!formWithDetails) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(formWithDetails)
    }

    const form = await getForm(id)

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Failed to get form:', error)
    return NextResponse.json(
      { error: 'Failed to get form' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Require admin authentication with group verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const { id } = await context.params
    const body = await request.json()
    const {
      name,
      slug,
      title,
      description,
      submitButtonText,
      successMessage,
      fields,
      sendEmailNotification,
      notificationEmail,
      isActive,
    } = body

    const safeName = name !== undefined ? sanitizeString(name, 120) : undefined
    const safeSlug = slug !== undefined ? sanitizeString(slug, 120).toLowerCase() : undefined

    if (safeSlug !== undefined && safeSlug !== '' && !SLUG_PATTERN.test(safeSlug)) {
      return NextResponse.json(
        { error: 'Slug must use lowercase letters, numbers, and hyphens only' },
        { status: 400 }
      )
    }

    if (fields !== undefined && !validateFields(fields)) {
      return NextResponse.json(
        { error: 'Invalid form field configuration' },
        { status: 400 }
      )
    }

    const result = await updateForm(id, {
      name: safeName,
      slug: safeSlug,
      title,
      description,
      submitButtonText,
      successMessage,
      fields: fields as FormField[],
      sendEmailNotification,
      notificationEmail: notificationEmail !== undefined ? sanitizeString(notificationEmail, 255) : undefined,
      isActive,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to update form' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to update form:', error)
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Require admin authentication with group verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const result = await deleteForm(id)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to delete form' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to delete form:', error)
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    )
  }
}
