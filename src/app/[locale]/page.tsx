import { setRequestLocale } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'
import { Hero, Problem, Solution, HowItWorks, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'
import { getHeroContent, getAboutContent, getImpactStats } from '@/lib/actions/content'
import { getProjects } from '@/lib/actions/projects'
import { getStockPhotoSettings } from '@/lib/actions/stock-photos'
import { getLocalizedValue, type Locale } from '@/i18n/config'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

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

  // Get localized content
  const localizedHero = heroContent ? {
    title: getLocalizedValue(heroContent.title, locale as Locale),
    subtitle: getLocalizedValue(heroContent.subtitle, locale as Locale),
    description: getLocalizedValue(heroContent.description, locale as Locale),
    ctaText: getLocalizedValue(heroContent.ctaText, locale as Locale),
    ctaLink: heroContent.ctaLink,
    backgroundImage: heroContent.backgroundImage,
  } : undefined

  return (
    <>
      <SchemaMarkup schema={schemas} />
      <Header />
      <main>
        <Hero
          title={localizedHero?.title || undefined}
          subtitle={localizedHero?.subtitle || undefined}
          description={localizedHero?.description || undefined}
          ctaText={localizedHero?.ctaText || undefined}
          ctaLink={localizedHero?.ctaLink ?? undefined}
          backgroundImage={localizedHero?.backgroundImage || stockPhotos.heroBackground}
          communityImage={stockPhotos.heroCommunity}
        />
        <Problem />
        <Solution
          projects={projects}
          impactStats={impactStats}
          aboutContent={aboutContent}
          locale={locale as Locale}
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
