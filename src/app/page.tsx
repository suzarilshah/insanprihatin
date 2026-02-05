import { Header, Footer } from '@/components/layout'
import { Hero, Problem, Solution, HowItWorks, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'
import { getHeroContent, getAboutContent, getImpactStats } from '@/lib/actions/content'
import { getProjects } from '@/lib/actions/projects'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Force dynamic to prevent prerender errors during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to get string from LocalizedString (default to English for root page)
const l = (value: LocalizedString | string | null | undefined): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

export default async function HomePage() {
  // Fetch content from database
  const [heroContent, aboutContent, impactStats, projects] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getImpactStats(),
    getProjects({ limit: 3, published: true }),
  ])

  const schemas = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateDonationSchema(),
  ]

  return (
    <>
      <SchemaMarkup schema={schemas} />
      <Header />
      <main>
        <Hero
          title={l(heroContent?.title)}
          subtitle={l(heroContent?.subtitle)}
          description={l(heroContent?.description)}
          ctaText={l(heroContent?.ctaText)}
          ctaLink={heroContent?.ctaLink ?? undefined}
          backgroundImage={heroContent?.backgroundImage ?? undefined}
        />
        <Problem />
        <Solution 
          projects={projects} 
          impactStats={impactStats} 
          aboutContent={aboutContent}
        />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
