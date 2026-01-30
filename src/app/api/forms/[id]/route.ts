import { NextRequest, NextResponse } from 'next/server'
import { getForm, updateForm, deleteForm, FormField } from '@/lib/actions/forms'
import { getSession } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
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
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const result = await updateForm(id, {
      name,
      slug,
      title,
      description,
      submitButtonText,
      successMessage,
      fields: fields as FormField[],
      sendEmailNotification,
      notificationEmail,
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
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
