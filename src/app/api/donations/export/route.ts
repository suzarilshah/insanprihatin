import { NextRequest, NextResponse } from 'next/server'
import { db, donations, projects } from '@/db'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

/**
 * Export Donations API
 *
 * Exports donations as CSV for admin reporting.
 * Only accessible to authenticated admins.
 */

interface ExportParams {
  status?: string
  project?: string
  from?: string
  to?: string
  environment?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: ExportParams = {
      status: searchParams.get('status') || undefined,
      project: searchParams.get('project') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      environment: searchParams.get('environment') || 'production',
    }

    // Build query conditions
    const conditions = []

    // Environment filter (default to production)
    if (params.environment && params.environment !== 'all') {
      conditions.push(eq(donations.environment, params.environment))
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      conditions.push(eq(donations.paymentStatus, params.status))
    }

    // Project filter
    if (params.project && params.project !== 'all') {
      conditions.push(eq(donations.projectId, params.project))
    }

    // Date range filter
    if (params.from) {
      conditions.push(gte(donations.createdAt, new Date(params.from)))
    }
    if (params.to) {
      const toDate = new Date(params.to)
      toDate.setHours(23, 59, 59, 999)
      conditions.push(lte(donations.createdAt, toDate))
    }

    // Fetch donations with project info
    const donationsList = await db.query.donations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(donations.createdAt)],
    })

    // Get all projects for lookup
    const projectsList = await db.query.projects.findMany({
      columns: {
        id: true,
        title: true,
      },
    })

    const projectMap = new Map(
      projectsList.map(p => [
        p.id,
        typeof p.title === 'string' ? p.title : getLocalizedValue(p.title as LocalizedString, 'en')
      ])
    )

    // Generate CSV
    const headers = [
      'Receipt Number',
      'Payment Reference',
      'Date',
      'Donor Name',
      'Donor Email',
      'Donor Phone',
      'Amount (RM)',
      'Project',
      'Status',
      'Environment',
      'Payment Method',
      'Transaction ID',
      'Anonymous',
      'Message',
      'Completed At',
    ]

    const rows = donationsList.map(d => [
      d.receiptNumber || '',
      d.paymentReference || '',
      d.createdAt ? new Date(d.createdAt).toISOString() : '',
      d.isAnonymous ? 'Anonymous' : (d.donorName || ''),
      d.donorEmail || '',
      d.donorPhone || '',
      (d.amount / 100).toFixed(2),
      d.projectId ? (projectMap.get(d.projectId) || 'Unknown Project') : 'General Fund',
      d.paymentStatus,
      d.environment || 'unknown',
      d.paymentMethod || 'toyyibpay',
      d.toyyibpayTransactionId || '',
      d.isAnonymous ? 'Yes' : 'No',
      d.message ? `"${d.message.replace(/"/g, '""')}"` : '',
      d.completedAt ? new Date(d.completedAt).toISOString() : '',
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        // Escape cells that contain commas or quotes
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(','))
    ].join('\n')

    // Generate filename with date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `donations-export-${dateStr}.csv`

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export donations' },
      { status: 500 }
    )
  }
}
