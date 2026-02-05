'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'
import { useState, useRef, useEffect } from 'react'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'compact'
  className?: string
}

/**
 * Language Switcher Component
 *
 * Allows users to switch between English and Bahasa Melayu.
 * The URL will update to reflect the chosen language (e.g., /en/about -> /ms/about)
 */
export default function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  // Compact variant - just shows flags/short codes
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
              loc === locale
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={localeNames[loc]}
          >
            {localeFlags[loc]}
          </button>
        ))}
      </div>
    )
  }

  // Buttons variant - shows all options as buttons
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              loc === locale
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {localeFlags[loc]} {loc.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all text-sm font-medium backdrop-blur-sm border border-white/10"
      >
        <span>{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                loc === locale
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {loc === locale && (
                <svg
                  className="w-4 h-4 ml-auto text-teal-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
