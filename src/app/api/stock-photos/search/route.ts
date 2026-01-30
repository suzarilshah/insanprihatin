import { NextRequest, NextResponse } from 'next/server'
import { createApi } from 'unsplash-js'

// Initialize Unsplash client (server-side only)
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

export interface StockPhoto {
  id: string
  description: string | null
  altDescription: string | null
  urls: {
    thumb: string
    small: string
    regular: string
    full: string
  }
  user: {
    name: string
    link: string
  }
  downloadLocation: string
  width: number
  height: number
  color: string
}

export interface SearchResponse {
  photos: StockPhoto[]
  total: number
  totalPages: number
  page: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('perPage') || '12', 10)

    // Check if API key is configured
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      )
    }

    // If no query, return curated photos
    if (!query || query.trim() === '') {
      const result = await unsplash.photos.list({
        page,
        perPage,
      })

      if (result.errors) {
        console.error('Unsplash API error:', result.errors)
        return NextResponse.json(
          { error: result.errors[0] || 'Failed to fetch photos' },
          { status: 500 }
        )
      }

      const photos: StockPhoto[] = result.response.results.map((photo) => ({
        id: photo.id,
        description: photo.description,
        altDescription: photo.alt_description,
        urls: {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
        },
        user: {
          name: photo.user.name,
          link: photo.user.links.html,
        },
        downloadLocation: photo.links.download_location,
        width: photo.width,
        height: photo.height,
        color: photo.color || '#f0f0f0',
      }))

      return NextResponse.json({
        photos,
        total: result.response.total,
        totalPages: Math.ceil(result.response.total / perPage),
        page,
      } as SearchResponse)
    }

    // Search photos
    const result = await unsplash.search.getPhotos({
      query: query.trim(),
      page,
      perPage,
      orientation: 'landscape',
    })

    if (result.errors) {
      console.error('Unsplash API error:', result.errors)
      return NextResponse.json(
        { error: result.errors[0] || 'Failed to search photos' },
        { status: 500 }
      )
    }

    const photos: StockPhoto[] = result.response.results.map((photo) => ({
      id: photo.id,
      description: photo.description,
      altDescription: photo.alt_description,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
      },
      user: {
        name: photo.user.name,
        link: photo.user.links.html,
      },
      downloadLocation: photo.links.download_location,
      width: photo.width,
      height: photo.height,
      color: photo.color || '#f0f0f0',
    }))

    return NextResponse.json({
      photos,
      total: result.response.total,
      totalPages: result.response.total_pages,
      page,
    } as SearchResponse)
  } catch (error) {
    console.error('Stock photos search error:', error)
    return NextResponse.json(
      { error: 'Failed to search photos' },
      { status: 500 }
    )
  }
}
