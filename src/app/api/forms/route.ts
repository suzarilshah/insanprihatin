import { NextRequest, NextResponse } from 'next/server'
import { getForms, createForm, FormField, getFormsWithStatsAndUsage } from '@/lib/actions/forms'
import { requireAuth } from '@/lib/auth/server'
import { enforceTrustedOrigin } from '@/lib/security/request'

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

export async function GET(request: NextRequest) {
  // SECURITY: Require admin authentication for listing forms
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const withStats = searchParams.get('withStats') === 'true'

    if (withStats) {
      const forms = await getFormsWithStatsAndUsage()
      return NextResponse.json(forms)
    }

    const forms = await getForms()
    return NextResponse.json(forms)
  } catch (error) {
    console.error('Failed to get forms:', error)
    return NextResponse.json(
      { error: 'Failed to get forms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const originCheck = enforceTrustedOrigin(request)
  if (originCheck) return originCheck

  // SECURITY: Require admin authentication with group verification
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

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
    } = body

    const safeName = sanitizeString(name, 120)
    const safeSlug = sanitizeString(slug, 120).toLowerCase()

    if (!safeName || !safeSlug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    if (!SLUG_PATTERN.test(safeSlug)) {
      return NextResponse.json(
        { error: 'Slug must use lowercase letters, numbers, and hyphens only' },
        { status: 400 }
      )
    }

    if (!validateFields(fields || [])) {
      return NextResponse.json(
        { error: 'Invalid form field configuration' },
        { status: 400 }
      )
    }

    const result = await createForm({
      name: safeName,
      slug: safeSlug,
      title,
      description,
      submitButtonText,
      successMessage,
      fields: (fields || []) as FormField[],
      sendEmailNotification,
      notificationEmail: sanitizeString(notificationEmail, 255) || undefined,
    })

    if (result.success) {
      return NextResponse.json(result.form)
    } else {
      return NextResponse.json(
        { error: 'Failed to create form' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Failed to create form:', error)
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    )
  }
}
