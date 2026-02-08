/**
 * Stock Photo Configuration
 *
 * Constants and types for stock photo management with Unsplash API compliance.
 * Includes photographer attribution for all photos as required by Unsplash guidelines.
 *
 * Image quality settings:
 * - q=85: High quality (85%)
 * - w=3840: 4K width for hero backgrounds
 * - w=1600: HD for portrait/community images
 * - w=2560: QHD for featured sections
 * - w=1400: HD for project cards
 */

// UTM parameters for Unsplash attribution (required by Unsplash API guidelines)
export const UNSPLASH_UTM = 'utm_source=insanprihatin&utm_medium=referral'

// Stock photo with attribution metadata
export interface StockPhotoWithAttribution {
  url: string
  label: string
  photographerName: string
  photographerUsername: string
  photoId: string
}

// Stock photo locations used in the website
export const STOCK_PHOTO_LOCATIONS = {
  heroBackground: {
    label: 'Hero Background',
    description: 'Main hero section background image',
    component: 'Hero.tsx',
    aspectRatio: '16:9',
    recommended: '3840x2160 (4K)',
  },
  heroCommunity: {
    label: 'Hero Community Image',
    description: 'Community joy image in hero section (desktop only)',
    component: 'Hero.tsx',
    aspectRatio: '4:5',
    recommended: '1600x2000 (HD)',
  },
  solutionFeatured: {
    label: 'Solution Featured Fallback',
    description: 'Fallback image for featured project in solution section',
    component: 'Solution.tsx',
    aspectRatio: '16:9',
    recommended: '2560x1440 (QHD)',
  },
  solutionProject1: {
    label: 'Solution Project 1 Fallback',
    description: 'Fallback image for secondary project 1',
    component: 'Solution.tsx',
    aspectRatio: '1:1',
    recommended: '1400x1400 (HD)',
  },
  solutionProject2: {
    label: 'Solution Project 2 Fallback',
    description: 'Fallback image for secondary project 2',
    component: 'Solution.tsx',
    aspectRatio: '1:1',
    recommended: '1400x1400 (HD)',
  },
} as const

export type StockPhotoLocation = keyof typeof STOCK_PHOTO_LOCATIONS

// Curated Unsplash photos for each category (HD quality) with attribution
export const CURATED_STOCK_PHOTOS = {
  charity: [
    {
      url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop',
      label: 'Community volunteers',
      photographerName: 'Helena Lopes',
      photographerUsername: 'wildlittlethingsphoto',
      photoId: '1517486808906-6ca8b3f04846',
    },
    {
      url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=85&w=3840&auto=format&fit=crop',
      label: 'Helping hands',
      photographerName: 'Joel Muniz',
      photographerUsername: 'jmuniz',
      photoId: '1559027615-cd4628902d4a',
    },
    {
      url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=85&w=3840&auto=format&fit=crop',
      label: 'Charity event',
      photographerName: 'Joel Muniz',
      photographerUsername: 'jmuniz',
      photoId: '1593113598332-cd288d649433',
    },
    {
      url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=85&w=3840&auto=format&fit=crop',
      label: 'Volunteers group',
      photographerName: 'Perry Grone',
      photographerUsername: 'perrygrone',
      photoId: '1469571486292-0ba58a3f068b',
    },
    {
      url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=85&w=3840&auto=format&fit=crop',
      label: 'Team collaboration',
      photographerName: 'krakenimages',
      photographerUsername: 'krakenimages',
      photoId: '1582213782179-e0d53f98f2ca',
    },
    {
      url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=3840&auto=format&fit=crop',
      label: 'Children learning',
      photographerName: 'Larm Rmah',
      photographerUsername: 'larm',
      photoId: '1488521787991-ed7bbaae773c',
    },
  ],
  community: [
    {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=1600&auto=format&fit=crop',
      label: 'Friends gathering',
      photographerName: 'Priscilla Du Preez 🇨🇦',
      photographerUsername: 'priscilladupreez',
      photoId: '1529156069898-49953e39b3ac',
    },
    {
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=85&w=1600&auto=format&fit=crop',
      label: 'Family together',
      photographerName: 'Tyler Nix',
      photographerUsername: 'jtylernix',
      photoId: '1511632765486-a01980e01a18',
    },
    {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=85&w=1600&auto=format&fit=crop',
      label: 'Students studying',
      photographerName: 'Priscilla Du Preez 🇨🇦',
      photographerUsername: 'priscilladupreez',
      photoId: '1523240795612-9a054b0db644',
    },
    {
      url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=85&w=1600&auto=format&fit=crop',
      label: 'Community meetup',
      photographerName: 'Brooke Cagle',
      photographerUsername: 'brookecagle',
      photoId: '1491438590914-bc09fcaaf77a',
    },
  ],
  education: [
    {
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=2560&auto=format&fit=crop',
      label: 'Education classroom',
      photographerName: 'kyo azuma',
      photographerUsername: 'kyoazuma',
      photoId: '1503676260728-1c00da094a0b',
    },
    {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=2560&auto=format&fit=crop',
      label: 'Students learning',
      photographerName: 'CDC',
      photographerUsername: 'cdc',
      photoId: '1509062522246-3755977927d7',
    },
    {
      url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=85&w=2560&auto=format&fit=crop',
      label: 'Books and education',
      photographerName: 'Kimberly Farmer',
      photographerUsername: 'kimberlyfarmer',
      photoId: '1497633762265-9d179a990aa6',
    },
    {
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=85&w=2560&auto=format&fit=crop',
      label: 'Teacher and students',
      photographerName: 'Taylor Wilcox',
      photographerUsername: 'taypaigey',
      photoId: '1577896851231-70ef18881754',
    },
  ],
  projects: [
    {
      url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=85&w=1400&auto=format&fit=crop',
      label: 'Community project',
      photographerName: 'Akson',
      photographerUsername: 'akson',
      photoId: '1531206715517-5c0ba140b2b8',
    },
    {
      url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=85&w=1400&auto=format&fit=crop',
      label: 'Project work',
      photographerName: 'Annie Spratt',
      photographerUsername: 'anniespratt',
      photoId: '1596422846543-75c6fc197f07',
    },
    {
      url: 'https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=85&w=1400&auto=format&fit=crop',
      label: 'Building project',
      photographerName: 'Josue Isai Ramos Figueroa',
      photographerUsername: 'jramos10',
      photoId: '1560252829-804f1aedf1be',
    },
  ],
} as const

export type StockPhotoCategory = keyof typeof CURATED_STOCK_PHOTOS

// Stock photo item with full attribution
export interface StockPhotoItem {
  url: string
  photographerName: string
  photographerUsername: string
  photoId: string
}

// Settings stored in database
export interface StockPhotoSettings {
  heroBackground: StockPhotoItem
  heroCommunity: StockPhotoItem
  solutionFeatured: StockPhotoItem
  solutionProject1: StockPhotoItem
  solutionProject2: StockPhotoItem
}

// Default stock photo values with attribution (HD quality)
export const DEFAULT_STOCK_PHOTOS: StockPhotoSettings = {
  heroBackground: {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop',
    photographerName: 'Helena Lopes',
    photographerUsername: 'wildlittlethingsphoto',
    photoId: '1517486808906-6ca8b3f04846',
  },
  heroCommunity: {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=1600&auto=format&fit=crop',
    photographerName: 'Priscilla Du Preez 🇨🇦',
    photographerUsername: 'priscilladupreez',
    photoId: '1529156069898-49953e39b3ac',
  },
  solutionFeatured: {
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=2560&auto=format&fit=crop',
    photographerName: 'kyo azuma',
    photographerUsername: 'kyoazuma',
    photoId: '1503676260728-1c00da094a0b',
  },
  solutionProject1: {
    url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=85&w=1400&auto=format&fit=crop',
    photographerName: 'Akson',
    photographerUsername: 'akson',
    photoId: '1531206715517-5c0ba140b2b8',
  },
  solutionProject2: {
    url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=85&w=1400&auto=format&fit=crop',
    photographerName: 'Annie Spratt',
    photographerUsername: 'anniespratt',
    photoId: '1596422846543-75c6fc197f07',
  },
}

// Helper to get photographer URL with UTM tracking
export function getPhotographerUrl(username: string): string {
  return `https://unsplash.com/@${username}?${UNSPLASH_UTM}`
}

// Helper to get Unsplash homepage URL with UTM tracking
export function getUnsplashUrl(): string {
  return `https://unsplash.com/?${UNSPLASH_UTM}`
}

// Helper to get photo URL on Unsplash with UTM tracking
export function getPhotoUrl(photoId: string): string {
  return `https://unsplash.com/photos/${photoId}?${UNSPLASH_UTM}`
}

// Helper to extract photo ID from Unsplash URL
export function extractPhotoId(url: string): string | null {
  const match = url.match(/photo-(\d+-[a-f0-9]+)/i)
  return match ? match[1] : null
}

// Legacy type support - for backward compatibility with existing database entries
export type LegacyStockPhotoSettings = {
  heroBackground: string
  heroCommunity: string
  solutionFeatured: string
  solutionProject1: string
  solutionProject2: string
}

// Helper to check if settings are legacy format (just URLs)
export function isLegacySettings(settings: unknown): settings is LegacyStockPhotoSettings {
  if (!settings || typeof settings !== 'object') return false
  const s = settings as Record<string, unknown>
  return typeof s.heroBackground === 'string'
}

// Helper to migrate legacy settings to new format
export function migrateLegacySettings(legacy: LegacyStockPhotoSettings): StockPhotoSettings {
  const findPhotoByUrl = (url: string): StockPhotoItem => {
    // Search through all curated photos to find metadata
    for (const category of Object.values(CURATED_STOCK_PHOTOS)) {
      for (const photo of category) {
        if (photo.url === url || url.includes(photo.photoId)) {
          return {
            url: photo.url,
            photographerName: photo.photographerName,
            photographerUsername: photo.photographerUsername,
            photoId: photo.photoId,
          }
        }
      }
    }
    // If not found in curated, extract photo ID and use placeholder
    const photoId = extractPhotoId(url) || 'unknown'
    return {
      url,
      photographerName: 'Unsplash Photographer',
      photographerUsername: 'unsplash',
      photoId,
    }
  }

  return {
    heroBackground: findPhotoByUrl(legacy.heroBackground),
    heroCommunity: findPhotoByUrl(legacy.heroCommunity),
    solutionFeatured: findPhotoByUrl(legacy.solutionFeatured),
    solutionProject1: findPhotoByUrl(legacy.solutionProject1),
    solutionProject2: findPhotoByUrl(legacy.solutionProject2),
  }
}
