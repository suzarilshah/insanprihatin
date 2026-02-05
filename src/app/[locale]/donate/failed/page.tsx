import { setRequestLocale } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import DonationFailedContent from './DonationFailedContent'
import { type Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Payment Failed | Yayasan Insan Prihatin',
  description: 'Your payment could not be processed. Please try again.',
}

export default async function DonationFailedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-foundation-cream to-white">
        <DonationFailedContent />
      </main>
      <Footer />
    </>
  )
}
