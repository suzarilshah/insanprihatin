import { NextRequest, NextResponse } from 'next/server'
import { db, donations } from '@/db'
import { eq } from 'drizzle-orm'
import { notifyDonationReceived } from '@/lib/actions/notifications'

// GET - Fetch donation stats or list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (reference) {
      // Fetch single donation by reference
      const donation = await db.query.donations.findFirst({
        where: eq(donations.paymentReference, reference),
      })

      if (!donation) {
        return NextResponse.json(
          { error: 'Donation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        donation: {
          id: donation.id,
          donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
          amount: donation.amount / 100,
          currency: donation.currency,
          status: donation.paymentStatus,
          reference: donation.paymentReference,
          message: donation.message,
          createdAt: donation.createdAt,
        },
      })
    }

    return NextResponse.json({ error: 'Reference parameter required' }, { status: 400 })
  } catch (error) {
    console.error('Donation fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      donorName,
      donorEmail,
      amount,
      currency = 'MYR',
      projectId,
      program,
      message,
      isAnonymous = false,
      donationType = 'one-time',
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'A valid donation amount is required' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum donation amount is RM 1' },
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

    // Generate a payment reference first
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const paymentReference = `YIP-${timestamp}-${randomPart}`

    // Create donation record with pending status
    const donation = await db.insert(donations).values({
      donorName: isAnonymous ? 'Anonymous' : donorName,
      donorEmail: donorEmail || null,
      amount: Math.round(amount * 100), // Store in cents
      currency,
      projectId: projectId || null,
      message: message ? `[${program || 'General'}] ${message}` : (program ? `[${program}]` : null),
      isAnonymous,
      paymentStatus: 'pending',
      paymentReference,
    }).returning()

    // Send notification to admin
    try {
      await notifyDonationReceived({
        donorName: isAnonymous ? 'Anonymous' : donorName,
        amount,
        currency,
        donationId: donation[0].id,
      })
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError)
      // Don't fail the donation if notification fails
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/donate/success?ref=${paymentReference}`
    const cancelUrl = `${baseUrl}/donate?cancelled=true`

    // Check if ToyyibPay is configured
    const toyyibPaySecretKey = process.env.TOYYIBPAY_SECRET_KEY
    const toyyibPayCategoryCode = process.env.TOYYIBPAY_CATEGORY_CODE

    if (toyyibPaySecretKey && toyyibPayCategoryCode) {
      // ToyyibPay integration
      try {
        const toyyibPayUrl = process.env.TOYYIBPAY_URL || 'https://toyyibpay.com'

        const billData = new URLSearchParams({
          userSecretKey: toyyibPaySecretKey,
          categoryCode: toyyibPayCategoryCode,
          billName: `Donation to Yayasan Insan Prihatin`,
          billDescription: program ? `${program} Fund Donation` : 'General Fund Donation',
          billPriceSetting: '1', // Fixed price
          billPayorInfo: '1', // Require payer info
          billAmount: String(Math.round(amount * 100)), // Amount in cents
          billReturnUrl: successUrl,
          billCallbackUrl: `${baseUrl}/api/donations/webhook`,
          billExternalReferenceNo: paymentReference,
          billTo: donorName || 'Anonymous Donor',
          billEmail: donorEmail || 'donor@yayasaninsanprihatin.org',
          billPhone: '0000000000',
          billContentEmail: `Thank you for your donation of RM ${amount} to Yayasan Insan Prihatin.`,
          billPaymentChannel: '0', // FPX only
          billChargeToCustomer: '1', // Charge fee to customer (optional)
        })

        const response = await fetch(`${toyyibPayUrl}/index.php/api/createBill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: billData.toString(),
        })

        const result = await response.json()

        if (result && result[0] && result[0].BillCode) {
          const billCode = result[0].BillCode
          const paymentUrl = `${toyyibPayUrl}/${billCode}`

          return NextResponse.json({
            success: true,
            message: 'Donation initiated successfully',
            donationId: donation[0].id,
            paymentReference,
            redirectUrl: paymentUrl,
            paymentMethod: 'toyyibpay',
          })
        }
      } catch (toyyibError) {
        console.error('ToyyibPay error:', toyyibError)
        // Fall through to manual payment flow
      }
    }

    // If no payment gateway configured, return manual payment flow
    return NextResponse.json({
      success: true,
      message: 'Donation recorded successfully',
      donationId: donation[0].id,
      paymentReference,
      redirectUrl: successUrl,
      paymentMethod: 'manual',
      bankDetails: {
        bankName: 'Maybank',
        accountNumber: '5123-4567-8910',
        accountName: 'Yayasan Insan Prihatin',
        reference: paymentReference,
      },
    })
  } catch (error) {
    console.error('Donation error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again.' },
      { status: 500 }
    )
  }
}

// PATCH - Update donation status (for admin or webhook)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, status } = body

    if (!reference || !status) {
      return NextResponse.json(
        { error: 'Reference and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    await db
      .update(donations)
      .set({ paymentStatus: status })
      .where(eq(donations.paymentReference, reference))

    return NextResponse.json({
      success: true,
      message: 'Donation status updated',
    })
  } catch (error) {
    console.error('Donation update error:', error)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}
