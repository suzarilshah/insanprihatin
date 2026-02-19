'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  interval?: number // in milliseconds
  enabled?: boolean
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  error: string | null
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: AutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
  })

  const dataRef = useRef(data)
  const lastSavedDataRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const save = useCallback(async (force = false) => {
    if (!enabled && !force) return

    const currentData = JSON.stringify(dataRef.current)

    // Skip if no changes
    if (currentData === lastSavedDataRef.current && !force) {
      return
    }

    setState((prev) => ({ ...prev, status: 'saving', error: null }))

    try {
      await onSave(dataRef.current)

      if (isMountedRef.current) {
        lastSavedDataRef.current = currentData
        setState({
          status: 'saved',
          lastSaved: new Date(),
          error: null,
        })

        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setState((prev) => ({ ...prev, status: 'idle' }))
          }
        }, 3000)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState({
          status: 'error',
          lastSaved: state.lastSaved,
          error: error instanceof Error ? error.message : 'Failed to save',
        })
      }
    }
  }, [enabled, onSave, state.lastSaved])

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return

    const intervalId = setInterval(() => {
      save()
    }, interval)

    return () => clearInterval(intervalId)
  }, [enabled, interval, save])

  // Debounced save on data change
  useEffect(() => {
    if (!enabled) return

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for debounced save (5 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      save()
    }, 5000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [data, enabled, save])

  // Save on page unload
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentData = JSON.stringify(dataRef.current)
      if (currentData !== lastSavedDataRef.current) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])

  return {
    ...state,
    save: () => save(true), // Force save
    hasUnsavedChanges: JSON.stringify(data) !== lastSavedDataRef.current,
  }
}

// Auto-save status indicator component
export function AutoSaveIndicator({
  status,
  lastSaved,
  error,
}: Pick<AutoSaveState, 'status' | 'lastSaved' | 'error'>) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'saving' && (
        <>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-600">Saving...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-600">Saved</span>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-600" title={error || undefined}>Failed to save</span>
        </>
      )}

      {status === 'idle' && lastSaved && (
        <>
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-gray-500">Last saved {formatTime(lastSaved)}</span>
        </>
      )}

      {status === 'idle' && !lastSaved && (
        <>
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-gray-400">Auto-save enabled</span>
        </>
      )}
    </div>
  )
}
