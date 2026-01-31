import { Header, Footer } from '@/components/layout'
import { Hero, Problem, Solution, HowItWorks, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'
import { getHeroContent, getAboutContent, getImpactStats } from '@/lib/actions/content'
import { getProjects } from '@/lib/actions/projects'

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
          title={heroContent?.title ?? undefined}
          subtitle={heroContent?.subtitle ?? undefined}
          description={heroContent?.description ?? undefined}
          ctaText={heroContent?.ctaText ?? undefined}
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
