import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { getBlogPost, getBlogPosts } from '@/lib/actions/blog'
import BlogPostContent from './BlogPostContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.metaTitle || `${post.title} | Yayasan Insan Prihatin`,
      description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      images: post.featuredImage ? [post.featuredImage] : undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}

export async function generateStaticParams() {
  const posts = await getBlogPosts({ published: true })
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post || !post.isPublished) {
    notFound()
  }

  // Get related posts (same category, excluding current)
  const allPosts = await getBlogPosts({ published: true })
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (post.category ? p.category === post.category : true))
    .slice(0, 3)

  return (
    <>
      <Header />
      <main>
        <BlogPostContent post={post} relatedPosts={relatedPosts} />
      </main>
      <Footer />
    </>
  )
}
