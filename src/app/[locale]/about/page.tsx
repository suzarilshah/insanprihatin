import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import AboutContent from './AboutContent'
import { getTeamMembers } from '@/lib/actions/team'
import { getAboutContent, getImpactStats } from '@/lib/actions/content'
import { type Locale } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    title: t('pageTitle'),
    description: locale === 'ms'
      ? 'Ketahui tentang misi, visi, pasukan kepimpinan Yayasan Insan Prihatin, dan komitmen kami untuk memperkasa komuniti.'
      : 'Learn about Yayasan Insan Prihatin\'s mission, vision, leadership team, and our commitment to empowering communities.',
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        'en': `${baseUrl}/en/about`,
        'ms': `${baseUrl}/ms/about`,
      },
    },
    openGraph: {
      title: `${t('pageTitle')} | Yayasan Insan Prihatin`,
      description: locale === 'ms'
        ? 'Temui kisah kami, misi, dan pasukan berdedikasi di sebalik yayasan kami.'
        : 'Discover our story, mission, and the dedicated team behind our foundation.',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Fetch data from database
  const [teamMembers, aboutData, impactStatsData] = await Promise.all([
    getTeamMembers({ active: true }),
    getAboutContent(),
    getImpactStats(),
  ])

  return (
    <>
      <Header />
      <main>
        <AboutContent
          teamMembers={teamMembers}
          aboutData={aboutData || null}
          impactStats={impactStatsData}
          locale={locale as Locale}
        />
      </main>
      <Footer />
    </>
  )
}
