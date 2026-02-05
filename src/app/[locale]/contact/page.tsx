import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import ContactContent from './ContactContent'
import { type Locale } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'

  return {
    title: t('pageTitle'),
    description: locale === 'ms'
      ? 'Hubungi Yayasan Insan Prihatin. Kami ingin mendengar daripada anda tentang perkongsian, sukarelawan, atau sebarang pertanyaan tentang program kami.'
      : 'Get in touch with Yayasan Insan Prihatin. We\'d love to hear from you about partnerships, volunteering, or any questions about our programs.',
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        'en': `${baseUrl}/en/contact`,
        'ms': `${baseUrl}/ms/contact`,
      },
    },
    openGraph: {
      title: `${t('pageTitle')} | Yayasan Insan Prihatin`,
      description: locale === 'ms'
        ? 'Hubungi kami untuk perkongsian, peluang sukarelawan, atau pertanyaan.'
        : 'Reach out to us for partnerships, volunteering opportunities, or inquiries.',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Header />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </>
  )
}
