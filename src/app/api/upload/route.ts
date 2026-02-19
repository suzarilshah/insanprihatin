import { NextRequest, NextResponse } from 'next/server'
import { Client, Storage, ID } from 'node-appwrite'

// Server-side Appwrite client with API key
const getClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  if (process.env.APPWRITE_API_KEY) {
    client.setKey(process.env.APPWRITE_API_KEY)
  }

  return client
}

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY) {
      console.error('APPWRITE_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error. Please add APPWRITE_API_KEY to your environment.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    const client = getClient()
    const storage = new Storage(client)

    // Upload to Appwrite using the File object directly
    // node-appwrite v22+ supports Web File API
    const response = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    )

    // Generate the file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    return NextResponse.json({
      success: true,
      fileId: response.$id,
      fileUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)

    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('unauthorized') || errorMessage.includes('403') || errorMessage.includes('permission')) {
      return NextResponse.json(
        { error: 'Storage permission denied. Check Appwrite bucket permissions or API key.' },
        { status: 403 }
      )
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json(
        { error: 'Storage bucket not found. Check NEXT_PUBLIC_APPWRITE_BUCKET_ID.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
