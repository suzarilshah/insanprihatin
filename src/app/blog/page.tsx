import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import BlogContent from './BlogContent'

export const metadata: Metadata = {
  title: 'Blog & News',
  description: 'Stay updated with the latest news, stories, and insights from Yayasan Insan Prihatin. Read about our impact, events, and community stories.',
  openGraph: {
    title: 'Blog & News | Yayasan Insan Prihatin',
    description: 'Stories of impact, news, and updates from our foundation.',
  },
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main>
        <BlogContent />
      </main>
      <Footer />
    </>
  )
}
