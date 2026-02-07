/**
 * Stock Photo Configuration
 *
 * Constants and types for stock photo management.
 * Separated from server actions to allow importing in client components.
 *
 * Image quality settings:
 * - q=85: High quality (85%)
 * - w=3840: 4K width for hero backgrounds
 * - w=1600: HD for portrait/community images
 * - w=2560: QHD for featured sections
 * - w=1400: HD for project cards
 */

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

// Curated Unsplash photos for each category (HD quality)
export const CURATED_STOCK_PHOTOS = {
  charity: [
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop', label: 'Community volunteers' },
    { url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=85&w=3840&auto=format&fit=crop', label: 'Helping hands' },
    { url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=85&w=3840&auto=format&fit=crop', label: 'Charity event' },
    { url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=85&w=3840&auto=format&fit=crop', label: 'Volunteers group' },
    { url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=85&w=3840&auto=format&fit=crop', label: 'Team collaboration' },
    { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=3840&auto=format&fit=crop', label: 'Children learning' },
  ],
  community: [
    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=1600&auto=format&fit=crop', label: 'Friends gathering' },
    { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=85&w=1600&auto=format&fit=crop', label: 'Family together' },
    { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=85&w=1600&auto=format&fit=crop', label: 'Students studying' },
    { url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=85&w=1600&auto=format&fit=crop', label: 'Community meetup' },
  ],
  education: [
    { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=2560&auto=format&fit=crop', label: 'Education classroom' },
    { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=2560&auto=format&fit=crop', label: 'Students learning' },
    { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=85&w=2560&auto=format&fit=crop', label: 'Books and education' },
    { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=85&w=2560&auto=format&fit=crop', label: 'Teacher and students' },
  ],
  projects: [
    { url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=85&w=1400&auto=format&fit=crop', label: 'Community project' },
    { url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=85&w=1400&auto=format&fit=crop', label: 'Project work' },
    { url: 'https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=85&w=1400&auto=format&fit=crop', label: 'Building project' },
  ],
} as const

export type StockPhotoCategory = keyof typeof CURATED_STOCK_PHOTOS

export interface StockPhotoSettings {
  heroBackground: string
  heroCommunity: string
  solutionFeatured: string
  solutionProject1: string
  solutionProject2: string
}

// Default stock photo values (HD quality)
export const DEFAULT_STOCK_PHOTOS: StockPhotoSettings = {
  heroBackground: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop',
  heroCommunity: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=1600&auto=format&fit=crop',
  solutionFeatured: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=2560&auto=format&fit=crop',
  solutionProject1: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=85&w=1400&auto=format&fit=crop',
  solutionProject2: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=85&w=1400&auto=format&fit=crop',
}
