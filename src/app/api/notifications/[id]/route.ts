import { NextRequest, NextResponse } from 'next/server'
import {
  markNotificationAsRead,
  dismissNotification,
  deleteNotification,
} from '@/lib/actions/notifications'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PATCH /api/notifications/[id] - Mark as read or dismiss
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action } = body

    if (action === 'markRead') {
      const result = await markNotificationAsRead(id)
      if (result.success) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json(
        { error: result.error || 'Failed to mark as read' },
        { status: 400 }
      )
    }

    if (action === 'dismiss') {
      const result = await dismissNotification(id)
      if (result.success) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json(
        { error: result.error || 'Failed to dismiss' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "markRead" or "dismiss"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Permanently delete notification
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const result = await deleteNotification(id)

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: result.error || 'Failed to delete notification' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
