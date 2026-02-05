'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/content'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string from LocalizedString (default to English)
const l = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

type Project = {
  id: string
  slug: string
  title: LocalizedString | string
  subtitle: LocalizedString | string | null
  description: LocalizedString | string
  content: LocalizedString | string | null
  featuredImage: string | null
  gallery: unknown
  category: string | null
  status: string | null
  startDate: Date | null
  endDate: Date | null
  budget: string | null
  beneficiaries: number | null
  location: string | null
  isPublished: boolean | null
  metaTitle: LocalizedString | string | null
  metaDescription: LocalizedString | string | null
  createdAt: Date
  updatedAt: Date
}

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface ContentForm {
  id: string
  name: string
  slug: string
  title?: LocalizedString | string
  description?: LocalizedString | string
  submitButtonText?: LocalizedString | string
  successMessage?: LocalizedString | string
  fields: FormField[]
  isActive: boolean
}

interface ProjectDetailContentProps {
  project: Project
  relatedProjects: Project[]
  forms?: ContentForm[]
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  upcoming: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
}

const defaultImage = 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670'

export default function ProjectDetailContent({ project, relatedProjects, forms = [] }: ProjectDetailContentProps) {
  const status = statusConfig[project.status || 'ongoing'] || statusConfig.ongoing
  const gallery = Array.isArray(project.gallery) ? project.gallery as string[] : []

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={project.featuredImage || defaultImage}
            alt={l(project.title)}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-sky-900/85" />
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="grain" />
        </div>

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[100px]"
        />

        <div className="relative container-wide z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-white/60 text-sm mb-6"
            >
              <Link href="/projects" className="hover:text-white transition-colors">
                Projects
              </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white/80">{l(project.title)}</span>
            </motion.div>

            {/* Status & Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${status.bg} ${status.text}`}>
                <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                {project.status || 'ongoing'}
              </span>
              {project.category && (
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium capitalize">
                  {project.category}
                </span>
              )}
            </motion.div>

            <h1 className="heading-display text-white mb-4">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {l(project.title)}
              </motion.span>
            </h1>

            {l(project.subtitle) && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-amber-400 text-xl font-medium mb-4"
              >
                {l(project.subtitle)}
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="body-large text-white/80 max-w-3xl"
            >
              {l(project.description)}
            </motion.p>
          </motion.div>

          {/* Project Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <div className="card-glass-dark inline-flex flex-wrap gap-8 md:gap-12 p-6">
              {project.location && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-white mb-1">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">{project.location}</span>
                  </div>
                  <div className="text-white/60 text-sm">Location</div>
                </div>
              )}
              {project.beneficiaries && (
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-white">
                    {project.beneficiaries.toLocaleString()}+
                  </div>
                  <div className="text-white/60 text-sm">Beneficiaries</div>
                </div>
              )}
              {project.startDate && (
                <div className="text-center">
                  <div className="font-semibold text-white">
                    {formatDate(project.startDate)}
                  </div>
                  <div className="text-white/60 text-sm">Started</div>
                </div>
              )}
              {project.budget && (
                <div className="text-center">
                  <div className="font-display text-xl font-bold text-white">
                    {project.budget}
                  </div>
                  <div className="text-white/60 text-sm">Budget</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding bg-white relative">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-elevated mb-12 -mt-24"
            >
              <Image
                src={project.featuredImage || defaultImage}
                alt={l(project.title)}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Main Content */}
            {l(project.content) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <MarkdownRenderer
                  content={l(project.content)}
                  forms={forms}
                  sourceContentType="projects"
                  sourceContentId={project.id}
                  sourceContentTitle={l(project.title)}
                />
              </motion.div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="font-heading text-2xl font-bold text-foundation-charcoal mb-6">
                  Project Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`${l(project.title)} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/20 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Share & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-foundation-pearl rounded-2xl"
            >
              <div>
                <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                  Support This Project
                </h3>
                <p className="text-gray-500">
                  Your contribution can help us reach more communities.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/donate" className="btn-primary">
                  Donate Now
                </Link>
                <Link href="/contact" className="btn-outline">
                  Get Involved
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="section-padding bg-foundation-pearl">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-section text-foundation-charcoal mb-4">
                Related Projects
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Explore more of our initiatives making a difference in communities.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject, index) => {
                const relatedStatus = statusConfig[relatedProject.status || 'ongoing'] || statusConfig.ongoing

                return (
                  <motion.div
                    key={relatedProject.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link
                      href={`/projects/${relatedProject.slug}`}
                      className="block card-elegant overflow-hidden group h-full"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={relatedProject.featuredImage || defaultImage}
                          alt={l(relatedProject.title)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${relatedStatus.bg} ${relatedStatus.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${relatedStatus.dot}`} />
                            {relatedProject.status || 'ongoing'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                          {l(relatedProject.title)}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {l(relatedProject.description)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/projects" className="btn-outline">
                View All Projects
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
