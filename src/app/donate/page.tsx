import { Metadata } from 'next'
import { Suspense } from 'react'
import { Header, Footer } from '@/components/layout'
import DonateContent from './DonateContent'
import { getSiteSetting } from '@/lib/actions/content'

// Force dynamic to prevent prerender errors during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Yayasan Insan Prihatin\'s mission to empower communities. Every donation makes a difference in education, healthcare, and community development.',
  openGraph: {
    title: 'Donate | Yayasan Insan Prihatin',
    description: 'Your generosity transforms lives. Donate today to support our community programs.',
  },
}

function DonateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-foundation-pearl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  )
}

export default async function DonatePage() {
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
