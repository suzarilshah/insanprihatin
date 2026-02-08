'use client'

import { useEffect, useRef } from 'react'

// Track which photos have been tracked in this session to avoid duplicate calls
const trackedPhotos = new Set<string>()

/**
 * Track an Unsplash photo view/download event
 *
 * This function calls our tracking API to trigger the Unsplash download event.
 * It only tracks each photo once per session.
 */
async function trackPhoto(photoId: string): Promise<void> {
  if (!photoId || trackedPhotos.has(photoId)) {
    return
  }

  trackedPhotos.add(photoId)

  try {
    await fetch('/api/stock-photos/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoId }),
    })
  } catch (error) {
    console.error('Failed to track Unsplash photo:', error)
  }
}

/**
 * Hook to track Unsplash photo usage when component mounts
 *
 * Usage:
 * ```tsx
 * useUnsplashTracking('1517486808906-6ca8b3f04846')
 * ```
 *
 * This tracks the photo once when the component mounts.
 * Duplicate tracking within the same session is prevented.
 */
export function useUnsplashTracking(photoId: string | undefined | null): void {
  useEffect(() => {
    if (photoId) {
      trackPhoto(photoId)
    }
  }, [photoId])
}

/**
 * Hook to track Unsplash photo usage when element enters viewport
 *
 * Usage:
 * ```tsx
 * const ref = useUnsplashTrackingOnView('1517486808906-6ca8b3f04846')
 * return <div ref={ref}>...</div>
 * ```
 *
 * This uses IntersectionObserver to track the photo only when it becomes visible.
 */
export function useUnsplashTrackingOnView<T extends HTMLElement>(
  photoId: string | undefined | null
): React.RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!photoId || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackPhoto(photoId)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [photoId])

  return ref
}

/**
 * Utility to manually track a photo (useful for imperative tracking)
 */
export function trackUnsplashPhoto(photoId: string): void {
  trackPhoto(photoId)
}
