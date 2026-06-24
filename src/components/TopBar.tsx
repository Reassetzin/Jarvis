'use client'
import { useState, useEffect } from 'react'
import { formatDate, getLocalDate } from '@/lib/utils'

interface WhoopEntry {
  recovery: number
  sleep_pct: number
  strain: number
  hrv: number
  rhr: number
  ai_summary: string
}

export default function TopBar() {
  const today = getLocalDate()
  const [whoop, setWhoop] = useState<WhoopEntry | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_whoop')
    if (raw) {
      const data = JSON.parse(raw) as Record<string, WhoopEntry>
      if (data[today]) setWhoop(data[today])
    }
  }, [today])

  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-xs text-gray-500">{formatDate(today)}</p>
      {whoop && (
        <div className="flex gap-3 mt-1">
          <span className="text-xs text-green-400">R {whoop.recovery}%</span>
          <span className="text-xs text-yellow-400">S {whoop.strain}</span>
          <span className="text-xs text-blue-400">HRV {whoop.hrv}ms</span>
        </div>
      )}
    </div>
  )
}
