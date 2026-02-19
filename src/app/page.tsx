import { Header, Footer } from '@/components/layout'
import { Hero, Problem, Solution, HowItWorks, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'
import { getHeroContent, getAboutContent, getImpactStats } from '@/lib/actions/content'
import { getProjects } from '@/lib/actions/projects'
import { getStockPhotoSettings } from '@/lib/actions/stock-photos'
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
  const [heroContent, aboutContent, impactStats, projects, stockPhotos] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getImpactStats(),
    getProjects({ limit: 3, published: true }),
    getStockPhotoSettings(),
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
          backgroundImage={heroContent?.backgroundImage || stockPhotos.heroBackground?.url}
          communityImage={stockPhotos.heroCommunity?.url}
        />
        <Problem />
        <Solution
          projects={projects}
          impactStats={impactStats}
          aboutContent={aboutContent}
          stockPhotos={{
            solutionFeatured: stockPhotos.solutionFeatured,
            solutionProject1: stockPhotos.solutionProject1,
            solutionProject2: stockPhotos.solutionProject2,
          }}
        />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
