import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import DonateContent from './DonateContent'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Yayasan Insan Prihatin\'s mission to empower communities. Every donation makes a difference in education, healthcare, and community development.',
  openGraph: {
    title: 'Donate | Yayasan Insan Prihatin',
    description: 'Your generosity transforms lives. Donate today to support our community programs.',
  },
}

export default function DonatePage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <DonateContent />
      </main>
      <Footer />
    </>
  )
}
