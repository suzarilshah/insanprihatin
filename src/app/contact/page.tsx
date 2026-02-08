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

  return (
    <>
      <Header />
      <main>
        <ContactContent contactSettings={contactSettings} />
      </main>
      <Footer contactSettings={contactSettings} />
    </>
  )
}
