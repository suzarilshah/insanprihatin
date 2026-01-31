import { NextRequest, NextResponse } from 'next/server'
import { db, donations } from '@/db'
import { eq } from 'drizzle-orm'
import { sendDonationReceiptEmail } from '@/lib/email'
import { getReceiptData } from '@/lib/receipt'
import { ReceiptPDF } from '@/lib/receipt-pdf'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

/**
 * Resend Receipt Email API
 *
 * Resends the donation receipt email to the donor.
 * Only works for completed donations with a receipt number.
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Get receipt data
    const receiptData = await getReceiptData(reference)

    if (!receiptData) {
      return NextResponse.json(
        { error: 'Receipt not found. The donation may not be completed yet.' },
        { status: 404 }
      )
    }

    if (receiptData.receiptNumber === 'Pending') {
      return NextResponse.json(
        { error: 'Receipt is still being generated. Please try again later.' },
        { status: 400 }
      )
    }

    if (!receiptData.donorEmail) {
      return NextResponse.json(
        { error: 'No email address on file for this donation.' },
        { status: 400 }
      )
    }

    // Generate PDF
    let pdfBuffer: Buffer | undefined
    try {
      pdfBuffer = await renderToBuffer(
        <ReceiptPDF data={receiptData} />
      )
    } catch (pdfError) {
      console.error('Failed to generate PDF for resend:', pdfError)
    }

    // Send email
    const emailResult = await sendDonationReceiptEmail({
      receiptNumber: receiptData.receiptNumber,
      donorName: receiptData.donorName,
      donorEmail: receiptData.donorEmail,
      amount: receiptData.amount,
      currency: receiptData.currency,
      projectTitle: receiptData.projectTitle,
      paymentReference: receiptData.paymentReference,
      completedAt: receiptData.completedAt,
      pdfBuffer,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || emailResult.reason || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update receipt sent timestamp
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentReference, reference),
    })

    if (donation) {
      await db
        .update(donations)
        .set({ receiptSentAt: new Date() })
        .where(eq(donations.id, donation.id))
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt email sent successfully',
      email: receiptData.donorEmail,
    })
  } catch (error) {
    console.error('Resend receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to resend receipt. Please try again.' },
      { status: 500 }
    )
  }
}
