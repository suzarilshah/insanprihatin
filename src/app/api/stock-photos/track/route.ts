import { NextRequest, NextResponse } from 'next/server'
import { createApi } from 'unsplash-js'

// Initialize Unsplash client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

/**
 * Track photo download/view event
 *
 * This endpoint triggers the Unsplash download tracking as required by their API guidelines.
 * It should be called when a photo is "used" (viewed prominently on the page).
 *
 * POST /api/stock-photos/track
 * Body: { photoId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoId } = body

    if (!photoId) {
      return NextResponse.json(
        { error: 'Missing required field: photoId' },
        { status: 400 }
      )
    }

    // Check API key
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      // Silently succeed if no API key - don't break the site
      console.warn('Unsplash API key not configured, skipping download tracking')
      return NextResponse.json({ success: true, tracked: false })
    }

    // Construct the download location URL from the photo ID
    // The download_location format is: https://api.unsplash.com/photos/{id}/download
    const downloadLocation = `https://api.unsplash.com/photos/${photoId}/download`

    // Trigger Unsplash download tracking
    try {
      await unsplash.photos.trackDownload({
        downloadLocation,
      })
      return NextResponse.json({ success: true, tracked: true })
    } catch (trackError) {
      console.error('Failed to track Unsplash download:', trackError)
      // Don't fail the request if tracking fails
      return NextResponse.json({ success: true, tracked: false, error: 'Tracking failed' })
    }
  } catch (error) {
    console.error('Stock photo track error:', error)
    return NextResponse.json(
      { error: 'Failed to process tracking request' },
      { status: 500 }
    )
  }
}
