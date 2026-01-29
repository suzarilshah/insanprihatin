'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

// Pages that have a dark hero section and need white text initially
const DARK_HERO_PAGES = ['/']

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null)

  // Check if current page has a dark hero section
  const hasDarkHero = DARK_HERO_PAGES.includes(pathname)

  // Use dark text if: scrolled OR on a page without dark hero
  const useDarkText = isScrolled || !hasDarkHero

  // Handle scroll behavior: show on scroll up, hide on scroll down
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const scrollThreshold = 20

    // Determine if scrolled past threshold
    setIsScrolled(currentScrollY > scrollThreshold)

    // Show/hide based on scroll direction (only when scrolled past threshold)
    if (currentScrollY > scrollThreshold) {
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down - hide navbar (but not if mobile menu is open)
        if (!isMobileMenuOpen) {
          setIsVisible(false)
        }
      } else {
        // Scrolling up - show navbar
        setIsVisible(true)
      }
    } else {
      // At top of page - always show
      setIsVisible(true)
    }

    lastScrollY.current = currentScrollY
  }, [isMobileMenuOpen])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Focus management for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Focus first menu item when opened
      setTimeout(() => {
        firstMenuItemRef.current?.focus()
      }, 100)
    }
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          // Show white background: when scrolled OR on pages without dark hero
          useDarkText
            ? 'bg-white/98 backdrop-blur-xl shadow-elegant'
            : 'bg-transparent',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
        role="banner"
      >
        <div className="container-wide">
          <nav
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              // Compact padding when scrolled OR on pages without dark hero
              useDarkText ? 'py-2' : 'py-4 md:py-6'
            )}
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-3 group"
              aria-label="Yayasan Insan Prihatin - Home"
            >
              <div
                className={cn(
                  'relative transition-all duration-300 group-hover:scale-105',
                  // Smaller logo when scrolled OR on pages without dark hero
                  useDarkText ? 'w-10 h-10' : 'w-12 h-12'
                )}
              >
                <Image
                  src="/images/logo.png"
                  alt="Yayasan Insan Prihatin Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                {/* Logo Text with proper contrast based on page and scroll state */}
                <span
                  className={cn(
                    'font-display font-bold tracking-tight transition-all duration-300 block',
                    useDarkText
                      ? 'text-lg text-foundation-charcoal'
                      : 'text-xl text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                  )}
                  style={{
                    // Ensure text is always visible with text shadow on dark backgrounds
                    textShadow: useDarkText
                      ? 'none'
                      : '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  Yayasan
                </span>
                <span
                  className={cn(
                    'block font-heading font-medium -mt-1 transition-all duration-300',
                    useDarkText ? 'text-xs text-amber-600' : 'text-sm text-amber-400'
                  )}
                >
                  Insan Prihatin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative font-medium text-sm tracking-wide transition-all duration-300',
                    'hover:text-teal-500 group py-2',
                    useDarkText
                      ? 'text-foundation-charcoal'
                      : 'text-white drop-shadow-sm'
                  )}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/donate"
                className={cn(
                  'px-5 py-2 rounded-full font-medium text-sm transition-all duration-300',
                  'bg-gradient-to-r from-amber-400 to-amber-500 text-foundation-charcoal',
                  'hover:shadow-glow-amber hover:-translate-y-0.5 active:translate-y-0'
                )}
              >
                Donate Now
              </Link>
            </div>

            {/* Mobile Menu Button - Accessible */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className={cn(
                'lg:hidden relative z-10 p-2 -mr-2 rounded-lg transition-colors duration-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
                useDarkText || isMobileMenuOpen
                  ? 'text-foundation-charcoal hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close menu' : 'Menu'}
              </span>
              <div className="w-6 h-6 flex flex-col items-center justify-center gap-1.5">
                <motion.span
                  animate={
                    isMobileMenuOpen
                      ? { rotate: 45, y: 6, width: 24 }
                      : { rotate: 0, y: 0, width: 24 }
                  }
                  transition={{ duration: 0.2 }}
                  className="h-0.5 bg-current rounded-full origin-center"
                  style={{ width: 24 }}
                />
                <motion.span
                  animate={
                    isMobileMenuOpen
                      ? { opacity: 0, width: 0 }
                      : { opacity: 1, width: 16 }
                  }
                  transition={{ duration: 0.2 }}
                  className="h-0.5 bg-current rounded-full self-end"
                />
                <motion.span
                  animate={
                    isMobileMenuOpen
                      ? { rotate: -45, y: -6, width: 24 }
                      : { rotate: 0, y: 0, width: 20 }
                  }
                  transition={{ duration: 0.2 }}
                  className="h-0.5 bg-current rounded-full self-end origin-center"
                />
              </div>
            </button>
          </nav>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              ref={mobileMenuRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-0 z-40 bg-white"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Menu Header - matches main header */}
              <div className="bg-white border-b border-gray-100">
                <div className="container-wide py-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3"
                    >
                      <div className="relative w-10 h-10">
                        <Image
                          src="/images/logo.png"
                          alt="Yayasan Insan Prihatin"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-display text-lg font-bold text-foundation-charcoal">
                          Yayasan
                        </span>
                        <span className="block font-heading text-xs font-medium -mt-1 text-amber-600">
                          Insan Prihatin
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 -mr-2 rounded-lg text-foundation-charcoal hover:bg-gray-100 transition-colors"
                      aria-label="Close menu"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="container-wide py-8 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 80px)' }}
              >
                <nav className="space-y-1" aria-label="Mobile menu">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        ref={index === 0 ? firstMenuItemRef : null}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center justify-between py-4 px-4 -mx-4 text-lg font-medium',
                          'text-foundation-charcoal hover:text-teal-500 hover:bg-gray-50',
                          'rounded-xl transition-all duration-200',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                        )}
                      >
                        {item.name}
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 pt-8 border-t border-gray-100"
                >
                  <Link
                    href="/donate"
                    onClick={closeMobileMenu}
                    className="btn-secondary w-full text-center"
                  >
                    Donate Now
                  </Link>

                  {/* Contact Info */}
                  <div className="mt-8 space-y-4 text-sm text-gray-500">
                    <a
                      href="mailto:info@insanprihatin.org"
                      className="flex items-center gap-3 hover:text-teal-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      info@insanprihatin.org
                    </a>
                    <a
                      href="tel:+60123456789"
                      className="flex items-center gap-3 hover:text-teal-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      +60 12-345 6789
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  )
}
