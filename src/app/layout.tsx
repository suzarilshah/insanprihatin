import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Outfit, JetBrains_Mono, Inter } from 'next/font/google'
import '@/styles/globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'),
  title: {
    default: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion',
    template: '%s | Yayasan Insan Prihatin',
  },
  description:
    'Yayasan Insan Prihatin is a prestigious Malaysian foundation dedicated to community service, education, and sustainable development. Join us in making a difference.',
  keywords: [
    'Yayasan Insan Prihatin',
    'Malaysian foundation',
    'charity Malaysia',
    'community service',
    'education foundation',
    'sustainable development',
    'social impact',
    'nonprofit Malaysia',
    'philanthropic organization',
  ],
  authors: [{ name: 'Yayasan Insan Prihatin' }],
  creator: 'Yayasan Insan Prihatin',
  publisher: 'Yayasan Insan Prihatin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: '/',
    siteName: 'Yayasan Insan Prihatin',
    title: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion',
    description:
      'A prestigious Malaysian foundation dedicated to community service, education, and sustainable development.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yayasan Insan Prihatin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yayasan Insan Prihatin',
    description: 'Empowering communities through compassion and sustainable development.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-MY': '/',
      'ms-MY': '/ms',
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2AADAD' },
    { media: '(prefers-color-scheme: dark)', color: '#1B7474' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${outfit.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
