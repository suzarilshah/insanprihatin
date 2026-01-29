'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getSiteSetting, updateSiteSetting } from '@/lib/actions/content'

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  const [settings, setSettings] = useState({
    siteName: 'Yayasan Insan Prihatin',
    siteTagline: 'Empowering Communities Through Compassion',
    contactEmail: 'info@insanprihatin.org',
    contactPhone: '+60 3-1234 5678',
    address: 'Kuala Lumpur, Malaysia',
    socialFacebook: '',
    socialInstagram: '',
    socialTwitter: '',
    socialLinkedIn: '',
    socialYoutube: '',
    primaryColor: '#0d9488',
    secondaryColor: '#f59e0b',
    googleAnalytics: '',
    facebookPixel: '',
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const [
          siteName,
          siteTagline,
          contactEmail,
          contactPhone,
          address,
          social,
        ] = await Promise.all([
          getSiteSetting('siteName'),
          getSiteSetting('siteTagline'),
          getSiteSetting('contactEmail'),
          getSiteSetting('contactPhone'),
          getSiteSetting('address'),
          getSiteSetting('social'),
        ])

        setSettings(prev => ({
          ...prev,
          siteName: (siteName as string) || prev.siteName,
          siteTagline: (siteTagline as string) || prev.siteTagline,
          contactEmail: (contactEmail as string) || prev.contactEmail,
          contactPhone: (contactPhone as string) || prev.contactPhone,
          address: (address as string) || prev.address,
          ...((social as Record<string, string>) || {}),
        }))
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await Promise.all([
          updateSiteSetting('siteName', settings.siteName),
          updateSiteSetting('siteTagline', settings.siteTagline),
          updateSiteSetting('contactEmail', settings.contactEmail),
          updateSiteSetting('contactPhone', settings.contactPhone),
          updateSiteSetting('address', settings.address),
          updateSiteSetting('social', {
            socialFacebook: settings.socialFacebook,
            socialInstagram: settings.socialInstagram,
            socialTwitter: settings.socialTwitter,
            socialLinkedIn: settings.socialLinkedIn,
            socialYoutube: settings.socialYoutube,
          }),
        ])
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } catch (error) {
        console.error('Failed to save:', error)
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'contact', label: 'Contact', icon: '📍' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Settings</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Site Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure your website's global settings
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                General Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                Social Media Links
              </h2>
              <div className="space-y-6">
                {[
                  { key: 'socialFacebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { key: 'socialInstagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'socialTwitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                  { key: 'socialLinkedIn', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                  { key: 'socialYoutube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                    <input
                      type="text"
                      value={settings[item.key as keyof typeof settings]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                      placeholder={item.placeholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-semibold text-foundation-charcoal mb-6">
                Analytics & Tracking
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    value={settings.googleAnalytics}
                    onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your Google Analytics 4 measurement ID</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={settings.facebookPixel}
                    onChange={(e) => setSettings({ ...settings, facebookPixel: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
