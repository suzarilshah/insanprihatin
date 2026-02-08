import { NextRequest, NextResponse } from 'next/server'
import { sendDonationReceiptEmail } from '@/lib/email'
import { getDefaultOrganizationConfig } from '@/lib/organization-config'
import { requireAuth } from '@/lib/auth/server'
import { RateLimiters } from '@/lib/api-rate-limit'

/**
 * Test Receipt Email API
 *
 * SECURITY: Requires admin authentication to prevent email abuse.
 * Use this endpoint to test if Resend is configured correctly.
 *
 * POST /api/test-receipt-email
 * Body: { email: "your@email.com" }
 * Requires: Valid admin session
 */
export async function POST(request: NextRequest) {
  // SECURITY: Require admin authentication
  try {
    await requireAuth()
  } catch {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in as admin.' },
      { status: 401 }
    )
  }

  // SECURITY: Rate limit test emails to prevent abuse
  const rateLimitResponse = RateLimiters.testEndpoint(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const testEmail = body.email

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email is required. Send: { "email": "your@email.com" }' },
        { status: 400 }
      )
    }

    console.log('========== TEST RECEIPT EMAIL ==========')
    console.log('Target email:', testEmail)
    console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET (using default)')

    // Create test receipt data
    const org = getDefaultOrganizationConfig()
    const testReceiptData = {
      receiptNumber: 'TEST-2025-000001',
      donorName: 'Test Donor',
      donorEmail: testEmail,
      donorPhone: '+60123456789',
      amount: 100.00,
      currency: 'MYR',
      projectTitle: 'General Fund',
      paymentReference: 'TEST-REF-123456',
      paymentMethod: 'FPX',
      completedAt: new Date(),
      createdAt: new Date(),
      organization: org,
    }

    // Generate PDF using dynamic import to avoid type issues
    console.log('Generating PDF...')
    let pdfBuffer: Buffer | undefined
    try {
      const { renderToBuffer } = await import('@react-pdf/renderer')
      const { ReceiptPDF } = await import('@/lib/receipt-pdf')
      const React = await import('react')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = React.createElement(ReceiptPDF as any, { data: testReceiptData })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await renderToBuffer(element as any)
      console.log('PDF generated successfully, size:', Math.round(pdfBuffer.length / 1024), 'KB')
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError)
      return NextResponse.json({
        success: false,
        error: 'PDF generation failed',
        details: pdfError instanceof Error ? pdfError.message : 'Unknown error',
      }, { status: 500 })
    }

    // Send email
    console.log('Sending test email...')
    const result = await sendDonationReceiptEmail({
      receiptNumber: testReceiptData.receiptNumber,
      donorName: testReceiptData.donorName,
      donorEmail: testReceiptData.donorEmail,
      amount: testReceiptData.amount,
      currency: testReceiptData.currency,
      projectTitle: testReceiptData.projectTitle,
      paymentReference: testReceiptData.paymentReference,
      completedAt: testReceiptData.completedAt,
      pdfBuffer,
      organization: testReceiptData.organization,
    })

    console.log('Email result:', result)
    console.log('============================================')

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test receipt email sent to ${testEmail}`,
        messageId: result.messageId,
        note: 'Check your inbox (and spam folder) for the email',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.reason,
        troubleshooting: [
          'Check if RESEND_API_KEY is correct in .env.local',
          'Check if EMAIL_FROM domain is verified at https://resend.com/domains',
          'Check Resend dashboard for errors: https://resend.com/emails',
        ],
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test receipt email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function GET() {
  // SECURITY: Require admin authentication to view config status
  try {
    await requireAuth()
  } catch {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    message: 'Test Receipt Email Endpoint',
    usage: 'POST /api/test-receipt-email with body: { "email": "your@email.com" }',
    config: {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '✓ Configured' : '✗ NOT configured',
      EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET (will use default onboarding@resend.dev)',
    },
  })
}
