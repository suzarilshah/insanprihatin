import { NextRequest, NextResponse } from 'next/server'
import { createApi } from 'unsplash-js'
import { Client, Storage, ID } from 'appwrite'

// Initialize Unsplash client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

// Initialize Appwrite client (server-side)
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const storage = new Storage(client)
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!

function getFileUrl(fileId: string): string {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoId, downloadLocation, imageUrl } = body

    if (!photoId || !downloadLocation || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: photoId, downloadLocation, imageUrl' },
        { status: 400 }
      )
    }

    // Check API key
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      )
    }

    // Trigger Unsplash download tracking (required by API guidelines)
    // This doesn't download the image, just tracks the download event
    try {
      await unsplash.photos.trackDownload({
        downloadLocation,
      })
    } catch (trackError) {
      console.error('Failed to track Unsplash download:', trackError)
      // Continue even if tracking fails
    }

    // Download the image from Unsplash
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download image from Unsplash' },
        { status: 500 }
      )
    }

    // Get the image as array buffer
    const imageBuffer = await imageResponse.arrayBuffer()

    // Determine content type and extension
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' :
                     contentType.includes('webp') ? 'webp' : 'jpg'

    // Create a Blob from the buffer
    const blob = new Blob([imageBuffer], { type: contentType })

    // Create a File object from the Blob
    const fileName = `unsplash-${photoId}-${Date.now()}.${extension}`
    const file = new File([blob], fileName, { type: contentType })

    // Upload to Appwrite
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file)
    const fileUrl = getFileUrl(response.$id)

    return NextResponse.json({
      success: true,
      fileId: response.$id,
      fileUrl,
    })
  } catch (error) {
    console.error('Stock photo download error:', error)
    return NextResponse.json(
      { error: 'Failed to download and upload stock photo' },
      { status: 500 }
    )
  }
}
