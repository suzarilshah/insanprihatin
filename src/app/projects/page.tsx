import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import ProjectsContent from './ProjectsContent'
import { getProjects } from '@/lib/actions/projects'

export const metadata: Metadata = {
  title: 'Projects & Initiatives',
  description: 'Explore the impactful projects and initiatives by Yayasan Insan Prihatin across education, healthcare, environment, and community development.',
  openGraph: {
    title: 'Projects & Initiatives | Yayasan Insan Prihatin',
    description: 'Discover how we are transforming lives through sustainable programs across Malaysia.',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  // Fetch published projects from database
  const projects = await getProjects({ published: true })

  return (
    <>
      <Header />
      <main>
        <ProjectsContent projects={projects} />
      </main>
      <Footer />
    </>
  )
}
