import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL: /en/about, /ms/about
})

// Export typed navigation components
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
