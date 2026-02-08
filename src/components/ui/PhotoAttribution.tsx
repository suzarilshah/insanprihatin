'use client'

import { getPhotographerUrl, getUnsplashUrl } from '@/lib/stock-photo-config'

interface PhotoAttributionProps {
  photographerName: string
  photographerUsername: string
  variant?: 'light' | 'dark' | 'overlay'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * PhotoAttribution Component
 *
 * Displays Unsplash-compliant photo attribution:
 * "Photo by [Photographer Name] on Unsplash"
 *
 * Both the photographer name and "Unsplash" are clickable links
 * with proper UTM tracking parameters as required by Unsplash guidelines.
 */
export default function PhotoAttribution({
  photographerName,
  photographerUsername,
  variant = 'overlay',
  size = 'sm',
  className = '',
}: PhotoAttributionProps) {
  const photographerUrl = getPhotographerUrl(photographerUsername)
  const unsplashUrl = getUnsplashUrl()

  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
  }

  const variantClasses = {
    light: 'text-gray-600',
    dark: 'text-white/90',
    overlay: 'text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded',
  }

  return (
    <span className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      Photo by{' '}
      <a
        href={photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white transition-colors"
      >
        {photographerName}
      </a>{' '}
      on{' '}
      <a
        href={unsplashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white transition-colors"
      >
        Unsplash
      </a>
    </span>
  )
}

/**
 * PhotoAttributionOverlay Component
 *
 * A positioned overlay version for use on images.
 * Includes hover reveal functionality.
 */
interface PhotoAttributionOverlayProps extends PhotoAttributionProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  showOnHover?: boolean
}

export function PhotoAttributionOverlay({
  photographerName,
  photographerUsername,
  position = 'bottom-left',
  showOnHover = true,
  size = 'sm',
  className = '',
}: PhotoAttributionOverlayProps) {
  const positionClasses = {
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 ${
        showOnHover ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''
      } ${className}`}
    >
      <PhotoAttribution
        photographerName={photographerName}
        photographerUsername={photographerUsername}
        variant="overlay"
        size={size}
      />
    </div>
  )
}
