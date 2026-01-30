import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import AboutContent from './AboutContent'
import { getTeamMembers } from '@/lib/actions/team'
import { getAboutContent, getImpactStats } from '@/lib/actions/content'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Yayasan Insan Prihatin\'s mission, vision, leadership team, and our commitment to empowering communities through compassion and sustainable development.',
  openGraph: {
    title: 'About Us | Yayasan Insan Prihatin',
    description: 'Discover our story, mission, and the dedicated team behind our foundation.',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
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
        />
      </main>
      <Footer />
    </>
  )
}
