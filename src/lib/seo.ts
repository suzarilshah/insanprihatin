import type { Metadata } from 'next'

const siteConfig = {
  name: 'Yayasan Insan Prihatin',
  description: 'A prestigious Malaysian foundation dedicated to community service, education, and sustainable development.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org',
  ogImage: '/images/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/insanprihatin',
    facebook: 'https://facebook.com/insanprihatin',
  },
}

interface PageSEOProps {
  title: string
  description: string
  path?: string
  ogImage?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  keywords?: string[]
}

export function generatePageMetadata({
  title,
  description,
  path = '',
  ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  keywords,
}: PageSEOProps): Metadata {
  const url = `${siteConfig.url}${path}`
  const image = ogImage || siteConfig.ogImage

  return {
    title,
    description,
    keywords: keywords || [
      'Yayasan Insan Prihatin',
      'Malaysian foundation',
      'charity Malaysia',
      'community service',
    ],
    authors: authors?.map((name) => ({ name })) || [{ name: siteConfig.name }],
    openGraph: {
      type,
      locale: 'en_MY',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
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
  }
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Yayasan Insan Prihatin',
    alternateName: 'YIP',
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Level 15, Menara Yayasan, Jalan Sultan Ismail',
      addressLocality: 'Kuala Lumpur',
      postalCode: '50250',
      addressCountry: 'MY',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+60-3-1234-5678',
      contactType: 'customer service',
      availableLanguage: ['English', 'Malay'],
    },
    sameAs: [
      'https://facebook.com/insanprihatin',
      'https://instagram.com/insanprihatin',
      'https://linkedin.com/company/insanprihatin',
      'https://twitter.com/insanprihatin',
    ],
    foundingDate: '2010',
    nonprofit: {
      '@type': 'NonprofitType',
    },
  }
}

// Website Schema
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

// Article Schema
export function generateArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}: {
  title: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  author: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${siteConfig.url}/images/og-image.jpg`,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author || siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }
}

// FAQ Schema
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Donation Action Schema
export function generateDonationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    description: 'Donate to support community programs',
    recipient: {
      '@type': 'NGO',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/donate`,
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
  }
}

// Event Schema (for projects/events)
export function generateEventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  url,
}: {
  name: string
  description: string
  startDate: string
  endDate?: string
  location: string
  image?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    endDate: endDate || startDate,
    location: {
      '@type': 'Place',
      name: location,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MY',
      },
    },
    image: image || `${siteConfig.url}/images/og-image.jpg`,
    url,
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }
}
