import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import BlogContent from './BlogContent'
import { getBlogPosts } from '@/lib/actions/blog'

export const metadata: Metadata = {
  title: 'Blog & News',
  description: 'Stay updated with the latest news, stories, and insights from Yayasan Insan Prihatin. Read about our impact, events, and community stories.',
  openGraph: {
    title: 'Blog & News | Yayasan Insan Prihatin',
    description: 'Stories of impact, news, and updates from our foundation.',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogPage() {
  // Fetch published blog posts from database
  const posts = await getBlogPosts({ published: true })

  return (
    <>
      <Header />
      <main>
        <BlogContent posts={posts} />
      </main>
      <Footer />
    </>
  )
}
