import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import ContactContent from './ContactContent'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Yayasan Insan Prihatin. We\'d love to hear from you about partnerships, volunteering, or any questions about our programs.',
  openGraph: {
    title: 'Contact Us | Yayasan Insan Prihatin',
    description: 'Reach out to us for partnerships, volunteering opportunities, or inquiries.',
  },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <ContactContent />
      </main>
      <Footer />
    </>
  )
}
