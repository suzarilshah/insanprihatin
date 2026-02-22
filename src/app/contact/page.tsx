import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import ContactContent from './ContactContent'
import { getContactSettings } from '@/lib/contact-settings'

// Force dynamic to prevent prerender errors during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Yayasan Insan Prihatin. We\'d love to hear from you about partnerships, volunteering, or any questions about our programs.',
  openGraph: {
    title: 'Contact Us | Yayasan Insan Prihatin',
    description: 'Reach out to us for partnerships, volunteering opportunities, or inquiries.',
  },
}

export default async function ContactPage() {
  const contactSettings = await getContactSettings()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Yayasan Insan Prihatin',
    url: baseUrl,
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactSettings.emails[0]?.address ?? 'admin@insanprihatin.org',
      telephone: contactSettings.phones[0]?.number ?? '+60 12-345 6789',
      contactType: 'customer service',
      availableLanguage: ['English', 'Malay'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: contactSettings.primaryAddress.lines.slice(0, -1).join(', '),
      addressCountry: 'MY',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <ContactContent contactSettings={contactSettings} />
      </main>
      <Footer contactSettings={contactSettings} />
    </>
  )
}
