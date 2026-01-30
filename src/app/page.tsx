import { Header, Footer } from '@/components/layout'
import { Hero, About, Impact, Programs, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'
import { getHeroContent, getAboutContent, getImpactStats } from '@/lib/actions/content'

export default async function HomePage() {
  // Fetch content from database
  const [heroContent, aboutContent, impactStats] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getImpactStats(),
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
        <About
          title={aboutContent?.title ?? undefined}
          content={aboutContent?.content ?? undefined}
          mission={aboutContent?.mission ?? undefined}
          vision={aboutContent?.vision ?? undefined}
          image={aboutContent?.image ?? undefined}
        />
        <Programs />
        <Impact stats={impactStats} />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
