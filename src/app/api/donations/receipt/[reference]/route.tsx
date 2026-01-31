import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getReceiptData } from '@/lib/receipt'
import { ReceiptPDF } from '@/lib/receipt-pdf'
import React from 'react'

/**
 * Receipt Download API
 *
 * Generates and returns a PDF receipt for a completed donation.
 * Only completed donations with a receipt number can generate receipts.
 */

export async function GET(
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

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <ReceiptPDF data={receiptData} />
    )

    // Return PDF as download (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="YIP-Receipt-${receiptData.receiptNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Receipt generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt. Please try again.' },
      { status: 500 }
    )
  }
}
