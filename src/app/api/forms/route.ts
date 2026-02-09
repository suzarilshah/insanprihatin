import { NextRequest, NextResponse } from 'next/server'
import { getForms, createForm, FormField, getFormsWithStatsAndUsage } from '@/lib/actions/forms'
import { requireAuth } from '@/lib/auth/server'

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

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const result = await createForm({
      name,
      slug,
      title,
      description,
      submitButtonText,
      successMessage,
      fields: (fields || []) as FormField[],
      sendEmailNotification,
      notificationEmail,
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
