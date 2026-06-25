'use client'
import { useState, useEffect, useCallback } from 'react'
import { shouldReset } from '@/lib/supabase'

interface StoredData<T> {
  data: T
  lastReset: string
  date: string
}

function getTodayStr(): string {
  const now = new Date()
  if (now.getHours() < 6) {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return y.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

export function useDailyStore<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(`los_${key}`)
    if (!raw) {
      setValue(defaultValue)
      setLoaded(true)
      return
    }
    try {
      const stored: StoredData<T> = JSON.parse(raw)
      if (shouldReset(stored.lastReset) || stored.date !== getTodayStr()) {
        setValue(defaultValue)
        const reset: StoredData<T> = { data: defaultValue, lastReset: new Date().toISOString(), date: getTodayStr() }
        localStorage.setItem(`los_${key}`, JSON.stringify(reset))
      } else {
        setValue(stored.data)
      }
    } catch {
      setValue(defaultValue)
    }
    setLoaded(true)
  }, [key])

  const set = useCallback((newVal: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newVal === 'function' ? (newVal as (p: T) => T)(prev) : newVal
      const stored: StoredData<T> = { data: next, lastReset: new Date().toISOString(), date: getTodayStr() }
      localStorage.setItem(`los_${key}`, JSON.stringify(stored))
      return next
    })
  }, [key])

  return [value, set, loaded] as const
}

export function usePersistentStore<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(`los_p_${key}`)
    if (raw) {
      try { setValue(JSON.parse(raw)) } catch { setValue(defaultValue) }
    }
    setLoaded(true)
  }, [key])

  const set = useCallback((newVal: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newVal === 'function' ? (newVal as (p: T) => T)(prev) : newVal
      localStorage.setItem(`los_p_${key}`, JSON.stringify(next))
      return next
    })
  }, [key])

  return [value, set, loaded] as const
}
