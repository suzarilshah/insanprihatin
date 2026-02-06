import Link from 'next/link'
import { db, heroContent, aboutContent, impactStats, faqs, pages } from '@/db'
import { eq, desc } from 'drizzle-orm'
import { type LocalizedString, getLocalizedValue } from '@/i18n/config'

// Helper to get string value from LocalizedString (default to English for admin display)
const getTextValue = (value: LocalizedString | string | null | undefined): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return getLocalizedValue(value, 'en')
}

async function getContentStatus() {
  const hero = await db.query.heroContent.findFirst({
    where: eq(heroContent.isActive, true),
  })

  const about = await db.query.aboutContent.findFirst()

  const stats = await db.query.impactStats.findMany({
    where: eq(impactStats.isActive, true),
  })

  const faqList = await db.query.faqs.findMany({
    where: eq(faqs.isActive, true),
  })

  const pagesList = await db.query.pages.findMany({
    orderBy: [desc(pages.updatedAt)],
  })

  return { hero, about, stats, faqList, pagesList }
}

const contentSections = [
  {
    id: 'hero',
    title: 'Hero Section',
    description: 'Main banner content on homepage',
    icon: '🎯',
    href: '/admin/dashboard/content/hero',
  },
  {
    id: 'about',
    title: 'About Section',
    description: 'Mission, vision, and values',
    icon: '📖',
    href: '/admin/dashboard/content/about',
  },
  {
    id: 'impact',
    title: 'Impact Statistics',
    description: 'Numbers and metrics displayed',
    icon: '📊',
    href: '/admin/dashboard/content/impact',
  },
  {
    id: 'faqs',
    title: 'FAQs',
    description: 'Frequently asked questions',
    icon: '❓',
    href: '/admin/dashboard/content/faqs',
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Address, phone, and email',
    icon: '📍',
    href: '/admin/dashboard/content/contact-info',
  },
  {
    id: 'seo',
    title: 'SEO Settings',
    description: 'Meta titles and descriptions',
    icon: '🔍',
    href: '/admin/dashboard/content/seo',
  },
]

export default async function ContentManagement() {
  const { hero, about, stats, faqList, pagesList } = await getContentStatus()

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Site Content</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Manage Site Content
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Update and manage your website&apos;s static content
          </p>
        </div>
      </div>

      {/* Content Status Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hero ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium text-foundation-charcoal">Hero Section</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">{hero ? 'Configured' : 'Not configured'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${about ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium text-foundation-charcoal">About Section</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">{about ? 'Configured' : 'Not configured'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium text-foundation-charcoal">Impact Stats</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">{stats.length} statistics</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${faqList.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium text-foundation-charcoal">FAQs</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">{faqList.length} questions</p>
        </div>
      </div>

      {/* Content Sections Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contentSections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
          >
            <div className="text-4xl mb-4">{section.icon}</div>
            <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2 group-hover:text-teal-600 transition-colors">
              {section.title}
            </h3>
            <p className="text-gray-500 text-sm mb-4">{section.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Click to edit
              </span>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Updates */}
      {pagesList.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-4">
            Page SEO Settings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Page</th>
                  <th className="pb-3 font-medium">Meta Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {pagesList.map((page) => (
                  <tr key={page.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <span className="font-medium text-foundation-charcoal">{getTextValue(page.title)}</span>
                      <span className="text-gray-400 text-sm ml-2">/{page.slug}</span>
                    </td>
                    <td className="py-3 text-gray-600 text-sm">
                      {getTextValue(page.metaTitle) || <span className="text-gray-400">Not set</span>}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-2">
              Content Management Tips
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Changes made here will be reflected on the live website after saving.
              Each section has a preview option to see how content will appear to visitors.
              Remember to keep content concise and impactful for better user engagement.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600">Keep titles under 60 chars</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600">Use clear CTAs</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600">Optimize images</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
