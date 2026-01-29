import { NextRequest, NextResponse } from 'next/server'
import { db, donations } from '@/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      donorName,
      donorEmail,
      amount,
      currency = 'MYR',
      projectId,
      message,
      isAnonymous = false,
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'A valid donation amount is required' },
        { status: 400 }
      )
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      return NextResponse.json(
        { error: 'Name and email are required for non-anonymous donations' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (donorEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(donorEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Create donation record with pending status
    const donation = await db.insert(donations).values({
      donorName: isAnonymous ? 'Anonymous' : donorName,
      donorEmail: donorEmail || null,
      amount: Math.round(amount * 100), // Store in cents
      currency,
      projectId: projectId || null,
      message: message || null,
      isAnonymous,
      paymentStatus: 'pending',
    }).returning()

    // Generate a payment reference
    const paymentReference = `YIP-${Date.now()}-${donation[0].id.slice(0, 8)}`

    // Update with payment reference
    await db
      .update(donations)
      .set({ paymentReference })
      .where(require('drizzle-orm').eq(donations.id, donation[0].id))

    // TODO: Integrate with payment gateway (e.g., Stripe, FPX, etc.)
    // const paymentSession = await createPaymentSession({
    //   amount: amount * 100,
    //   currency,
    //   reference: paymentReference,
    //   description: `Donation to Yayasan Insan Prihatin`,
    //   successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success?ref=${paymentReference}`,
    //   cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/donate?cancelled=true`,
    // })

    return NextResponse.json({
      success: true,
      message: 'Donation initiated successfully',
      donationId: donation[0].id,
      paymentReference,
      // redirectUrl: paymentSession.url, // Payment gateway redirect
    })
  } catch (error) {
    console.error('Donation error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again.' },
      { status: 500 }
    )
  }
}
