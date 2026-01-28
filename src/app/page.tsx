import { Header, Footer } from '@/components/layout'
import { Hero, About, Impact, Programs, CTA } from '@/components/sections'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'
import { generateOrganizationSchema, generateWebsiteSchema, generateDonationSchema } from '@/lib/seo'

export default function HomePage() {
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
        <Hero />
        <About />
        <Programs />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
