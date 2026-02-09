import { NextRequest, NextResponse } from 'next/server'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  dismissAllNotifications,
} from '@/lib/actions/notifications'
import { requireAuth } from '@/lib/auth/server'

// GET /api/notifications - Get notifications with optional filters
export async function GET(request: NextRequest) {
  // SECURITY: Require admin authentication
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const countOnly = searchParams.get('countOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // If only count is needed
    if (countOnly) {
      const count = await getUnreadNotificationCount()
      return NextResponse.json({ count })
    }

    // Get notifications
    const notifications = await getNotifications({
      unreadOnly,
      limit,
      offset,
    })

    // Also get unread count for badge
    const unreadCount = await getUnreadNotificationCount()

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Bulk actions (mark all read, dismiss all)
export async function PATCH(request: NextRequest) {
  // SECURITY: Require admin authentication
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'markAllRead') {
      const result = await markAllNotificationsAsRead()
      if (result.success) {
        return NextResponse.json({ success: true, count: result.count })
      }
      return NextResponse.json(
        { error: result.error || 'Failed to mark all as read' },
        { status: 400 }
      )
    }

    if (action === 'dismissAll') {
      const result = await dismissAllNotifications()
      if (result.success) {
        return NextResponse.json({ success: true, count: result.count })
      }
      return NextResponse.json(
        { error: result.error || 'Failed to dismiss all' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to perform bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
