import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/actions/blog'
import { getProjects } from '@/lib/actions/projects'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.insanprihatin.org'
  const locales = ['en', 'ms']

  // Static pages with their priorities
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/projects', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/donate', priority: 0.9, changeFrequency: 'weekly' as const },
  ]

  // Generate static page URLs for all locales
  const staticUrls: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: locales.reduce(
          (acc, loc) => ({
            ...acc,
            [loc]: `${baseUrl}/${loc}${page.path}`,
          }),
          {} as Record<string, string>
        ),
      },
    }))
  )

  // Fetch dynamic content
  const [blogPosts, projects] = await Promise.all([
    getBlogPosts({ published: true }),
    getProjects({ published: true }),
  ])

  // Generate blog post URLs for all locales
  const blogUrls: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || post.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: locales.reduce(
          (acc, loc) => ({
            ...acc,
            [loc]: `${baseUrl}/${loc}/blog/${post.slug}`,
          }),
          {} as Record<string, string>
        ),
      },
    }))
  )

  // Generate project URLs for all locales
  const projectUrls: MetadataRoute.Sitemap = projects.flatMap((project) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/projects/${project.slug}`,
      lastModified: project.updatedAt || project.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: locales.reduce(
          (acc, loc) => ({
            ...acc,
            [loc]: `${baseUrl}/${loc}/projects/${project.slug}`,
          }),
          {} as Record<string, string>
        ),
      },
    }))
  )

  // Add root URL that redirects to /en
  const rootUrl: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  return [...rootUrl, ...staticUrls, ...blogUrls, ...projectUrls]
}
