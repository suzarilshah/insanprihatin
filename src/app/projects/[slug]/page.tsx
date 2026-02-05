import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { getProject, getProjects } from '@/lib/actions/projects'
import { extractFormSlugs, getFormsBySlugs } from '@/lib/actions/forms'
import ProjectDetailContent from './ProjectDetailContent'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string from LocalizedString (default to English)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  return {
    title: l(project.metaTitle) || l(project.title),
    description: l(project.metaDescription) || l(project.description),
    openGraph: {
      title: l(project.metaTitle) || `${l(project.title)} | Yayasan Insan Prihatin`,
      description: l(project.metaDescription) || l(project.description),
      images: project.featuredImage ? [project.featuredImage] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const projects = await getProjects({ published: true })
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project || !project.isPublished) {
    notFound()
  }

  // Get related projects (same category, excluding current)
  const allProjects = await getProjects({ published: true, category: project.category || undefined })
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id)
    .slice(0, 3)

  // Extract and fetch embedded forms from content
  const contentStr = l(project.content)
  const formSlugs = contentStr ? await extractFormSlugs(contentStr) : []
  const forms = formSlugs.length > 0 ? await getFormsBySlugs(formSlugs) : []

  // Transform forms to match the expected format
  const transformedForms = forms.map(form => ({
    id: form.id,
    name: form.name,
    slug: form.slug,
    title: form.title || undefined,
    description: form.description || undefined,
    submitButtonText: form.submitButtonText || undefined,
    successMessage: form.successMessage || undefined,
    fields: form.fields as unknown as Array<{
      id: string
      type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
      label: string
      placeholder?: string
      required?: boolean
      options?: string[]
    }>,
    isActive: form.isActive || false,
  }))

  return (
    <>
      <Header />
      <main>
        <ProjectDetailContent
          project={project}
          relatedProjects={relatedProjects}
          forms={transformedForms}
        />
      </main>
      <Footer />
    </>
  )
}
