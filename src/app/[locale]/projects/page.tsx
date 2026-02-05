import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import ProjectsContent from './ProjectsContent'
import { getProjects } from '@/lib/actions/projects'
import { type Locale } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    title: t('pageTitle'),
    description: locale === 'ms'
      ? 'Terokai projek dan inisiatif berimpak oleh Yayasan Insan Prihatin dalam pendidikan, kesihatan, alam sekitar, dan pembangunan komuniti.'
      : 'Explore the impactful projects and initiatives by Yayasan Insan Prihatin across education, healthcare, environment, and community development.',
    alternates: {
      canonical: `${baseUrl}/${locale}/projects`,
      languages: {
        'en': `${baseUrl}/en/projects`,
        'ms': `${baseUrl}/ms/projects`,
      },
    },
    openGraph: {
      title: `${t('pageTitle')} | Yayasan Insan Prihatin`,
      description: locale === 'ms'
        ? 'Temui bagaimana kami mengubah kehidupan melalui program mampan di seluruh Malaysia.'
        : 'Discover how we are transforming lives through sustainable programs across Malaysia.',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Fetch published projects from database
  const projects = await getProjects({ published: true })

  return (
    <>
      <Header />
      <main>
        <ProjectsContent projects={projects} />
      </main>
      <Footer />
    </>
  )
}
