'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  isRead: boolean
  createdAt: Date
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch('/api/messages')
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()
  }, [])

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.isRead
    if (filter === 'read') return m.isRead
    return true
  })

  const unreadCount = messages.filter(m => !m.isRead).length

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      try {
        await fetch(`/api/messages/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
        setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE' })
        setMessages(messages.filter(m => m.id !== id))
        setSelectedMessage(null)
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    })
  }

  const openMessage = (msg: Message) => {
    setSelectedMessage(msg)
    if (!msg.isRead) {
      handleMarkAsRead(msg.id)
    }
  }

  function formatDate(date: Date) {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 24) {
      return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
    }
    if (days < 7) {
      return d.toLocaleDateString('en-MY', { weekday: 'short' })
    }
    return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <span>/</span>
            <span className="text-foundation-charcoal">Messages</span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-foundation-charcoal">
            Contact Messages
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage contact form submissions
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium">
            {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <motion.button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === msg.id ? 'bg-teal-50' : ''
                } ${!msg.isRead ? 'bg-amber-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                      )}
                      <span className={`font-medium truncate ${!msg.isRead ? 'text-foundation-charcoal' : 'text-gray-600'}`}>
                        {msg.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {msg.subject || 'No subject'}
                    </p>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {msg.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages</p>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foundation-charcoal">
                    {selectedMessage.subject || 'No subject'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-500">Phone: {selectedMessage.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(selectedMessage.createdAt).toLocaleString('en-MY')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={isPending}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed p-12 flex items-center justify-center"
            >
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Select a message to view</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
