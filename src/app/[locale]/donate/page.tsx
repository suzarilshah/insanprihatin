import { Metadata } from 'next'
import { Suspense } from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import DonateContent from './DonateContent'
import { type Locale } from '@/i18n/config'
import { getSiteSetting } from '@/lib/actions/content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'donate' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    title: t('pageTitle'),
    description: locale === 'ms'
      ? 'Sokong misi Yayasan Insan Prihatin untuk memperkasakan komuniti. Setiap derma memberi impak dalam pendidikan, kesihatan, dan pembangunan komuniti.'
      : 'Support Yayasan Insan Prihatin\'s mission to empower communities. Every donation makes a difference in education, healthcare, and community development.',
    alternates: {
      canonical: `${baseUrl}/${locale}/donate`,
      languages: {
        'en': `${baseUrl}/en/donate`,
        'ms': `${baseUrl}/ms/donate`,
      },
    },
    openGraph: {
      title: `${t('pageTitle')} | Yayasan Insan Prihatin`,
      description: locale === 'ms'
        ? 'Kemurahan hati anda mengubah kehidupan. Derma hari ini untuk menyokong program komuniti kami.'
        : 'Your generosity transforms lives. Donate today to support our community programs.',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function DonateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-foundation-pearl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  )
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const donationClosedSetting = await getSiteSetting('donationsClosed') as {
    closed: boolean
    reason: { en: string; ms: string } | null
  } | null

  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<DonateLoading />}>
          <DonateContent
            donationsClosed={donationClosedSetting?.closed ?? false}
            closureReason={donationClosedSetting?.reason ?? null}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
