import { NextResponse } from 'next/server'

/**
 * Test endpoint to debug ToyyibPay connection
 * DELETE THIS FILE AFTER DEBUGGING
 */
export async function GET() {
  const TOYYIBPAY_URL = process.env.TOYYIBPAY_URL || 'https://dev.toyyibpay.com'
  const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY || ''

  console.log('[ToyyibPay Test] Starting connection test...')
  console.log('[ToyyibPay Test] URL:', TOYYIBPAY_URL)
  console.log('[ToyyibPay Test] Secret key exists:', !!TOYYIBPAY_SECRET_KEY)
  console.log('[ToyyibPay Test] Secret key length:', TOYYIBPAY_SECRET_KEY.length)

  if (!TOYYIBPAY_SECRET_KEY) {
    return NextResponse.json({
      success: false,
      error: 'TOYYIBPAY_SECRET_KEY not configured',
      envVars: {
        TOYYIBPAY_URL: TOYYIBPAY_URL,
        hasSecretKey: false,
      }
    })
  }

  try {
    const formData = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET_KEY,
      catname: 'Test Category',
      catdescription: 'Test category for debugging',
    })

    const apiUrl = `${TOYYIBPAY_URL}/index.php/api/createCategory`
    console.log('[ToyyibPay Test] Calling:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    console.log('[ToyyibPay Test] Response status:', response.status)
    console.log('[ToyyibPay Test] Response headers:', Object.fromEntries(response.headers))

    const text = await response.text()
    console.log('[ToyyibPay Test] Response body:', text)

    let json
    try {
      json = JSON.parse(text)
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response',
        responseText: text,
        status: response.status,
      })
    }

    return NextResponse.json({
      success: true,
      response: json,
      status: response.status,
      envVars: {
        TOYYIBPAY_URL: TOYYIBPAY_URL,
        hasSecretKey: true,
        secretKeyLength: TOYYIBPAY_SECRET_KEY.length,
      }
    })

  } catch (error) {
    console.error('[ToyyibPay Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      envVars: {
        TOYYIBPAY_URL: TOYYIBPAY_URL,
        hasSecretKey: !!TOYYIBPAY_SECRET_KEY,
      }
    })
  }
}
