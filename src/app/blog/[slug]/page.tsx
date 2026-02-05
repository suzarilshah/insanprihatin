import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { getBlogPost, getBlogPosts } from '@/lib/actions/blog'
import { extractFormSlugs, getFormsBySlugs } from '@/lib/actions/forms'
import BlogPostContent from './BlogPostContent'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string from LocalizedString (default to English)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

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
    title: l(post.metaTitle) || l(post.title),
    description: l(post.metaDescription) || l(post.excerpt) || l(post.content).substring(0, 160),
    openGraph: {
      title: l(post.metaTitle) || `${l(post.title)} | Yayasan Insan Prihatin`,
      description: l(post.metaDescription) || l(post.excerpt) || l(post.content).substring(0, 160),
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

  // Extract and fetch embedded forms from content
  const formSlugs = await extractFormSlugs(l(post.content))
  const forms = formSlugs.length > 0 ? await getFormsBySlugs(formSlugs) : []

  // Transform forms to match the expected format
  const transformedForms = forms.map(form => ({
    id: form.id,
    name: form.name,
    slug: form.slug,
    title: form.title || undefined,
    description: form.description || undefined,
    submitButtonText: form.submitButtonText || undefined,
    successMessage: form.successMessage || undefined,
    fields: form.fields as unknown as Array<{
      id: string
      type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
      label: string
      placeholder?: string
      required?: boolean
      options?: string[]
    }>,
    isActive: form.isActive || false,
  }))

  return (
    <>
      <Header />
      <main>
        <BlogPostContent
          post={post}
          relatedPosts={relatedPosts}
          forms={transformedForms}
        />
      </main>
      <Footer />
    </>
  )
}
