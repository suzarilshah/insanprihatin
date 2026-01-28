import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import ProjectsContent from './ProjectsContent'

export const metadata: Metadata = {
  title: 'Projects & Initiatives',
  description: 'Explore the impactful projects and initiatives by Yayasan Insan Prihatin across education, healthcare, environment, and community development.',
  openGraph: {
    title: 'Projects & Initiatives | Yayasan Insan Prihatin',
    description: 'Discover how we are transforming lives through sustainable programs across Malaysia.',
  },
}

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <ProjectsContent />
      </main>
      <Footer />
    </>
  )
}
