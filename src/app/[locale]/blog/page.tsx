import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import BlogContent from './BlogContent'
import { getBlogPosts } from '@/lib/actions/blog'
import { type Locale } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    title: t('pageTitle'),
    description: locale === 'ms'
      ? 'Ikuti berita terkini, cerita, dan pandangan dari Yayasan Insan Prihatin. Baca tentang impak, acara, dan cerita komuniti kami.'
      : 'Stay updated with the latest news, stories, and insights from Yayasan Insan Prihatin. Read about our impact, events, and community stories.',
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        'en': `${baseUrl}/en/blog`,
        'ms': `${baseUrl}/ms/blog`,
      },
    },
    openGraph: {
      title: `${t('pageTitle')} | Yayasan Insan Prihatin`,
      description: locale === 'ms'
        ? 'Cerita impak, berita, dan kemas kini dari yayasan kami.'
        : 'Stories of impact, news, and updates from our foundation.',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

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
