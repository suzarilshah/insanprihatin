import { Suspense } from 'react'
import DonationFailedContent from './DonationFailedContent'

export const metadata = {
  title: 'Payment Failed | Yayasan Insan Prihatin',
  description: 'Your payment was not completed. You can try again or contact us for assistance.',
}

export default function DonationFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <DonationFailedContent />
    </Suspense>
  )
}
