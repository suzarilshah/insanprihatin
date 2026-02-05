import { Suspense } from 'react'
import { Header, Footer } from '@/components/layout'
import DonationSuccessContent from './DonationSuccessContent'

// Force dynamic to prevent prerender errors during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Thank You for Your Donation | Yayasan Insan Prihatin',
  description: 'Thank you for your generous donation to Yayasan Insan Prihatin.',
}

export default function DonationSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-foundation-cream to-white">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
          </div>
        }>
          <DonationSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
