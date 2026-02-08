import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import { Playfair_Display, Cormorant_Garamond, Outfit, JetBrains_Mono, Inter } from 'next/font/google'
import type { Metadata } from 'next'

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

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// Generate metadata with hreflang tags
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: locale === 'ms'
        ? 'Yayasan Insan Prihatin | Memperkasakan Komuniti Melalui Ihsan terhadap Insan'
        : 'Yayasan Insan Prihatin | Empowering Communities Through Compassion',
      template: '%s | Yayasan Insan Prihatin',
    },
    description: locale === 'ms'
      ? 'Yayasan Insan Prihatin adalah yayasan Malaysia berprestij yang berdedikasi untuk perkhidmatan komuniti, pendidikan, dan pembangunan mampan.'
      : 'Yayasan Insan Prihatin is a prestigious Malaysian foundation dedicated to community service, education, and sustainable development.',
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'ms': `${baseUrl}/ms`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
      alternateLocale: locale === 'ms' ? 'en_MY' : 'ms_MY',
      url: `${baseUrl}/${locale}`,
      siteName: 'Yayasan Insan Prihatin',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client side
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${cormorant.variable} ${outfit.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* LCP Optimization: Preload hero background image */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=3840&auto=format&fit=crop"
          fetchPriority="high"
        />
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
