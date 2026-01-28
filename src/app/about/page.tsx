import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Yayasan Insan Prihatin\'s mission, vision, leadership team, and our commitment to empowering communities through compassion and sustainable development.',
  openGraph: {
    title: 'About Us | Yayasan Insan Prihatin',
    description: 'Discover our story, mission, and the dedicated team behind our foundation.',
  },
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <AboutContent />
      </main>
      <Footer />
    </>
  )
}
