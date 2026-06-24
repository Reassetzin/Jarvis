'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

const GOAL = 8

export default function WaterTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, number>>({})

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_water')
    if (raw) setLogs(JSON.parse(raw) as Record<string, number>)
  }, [])

  const count = logs[today] || 0
  const pct = Math.min(100, (count / GOAL) * 100)

  const update = (delta: number) => {
    const updated = { ...logs, [today]: Math.max(0, count + delta) }
    setLogs(updated)
    localStorage.setItem('jarvis_water', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">WATER</div>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => update(-1)} className="w-8 h-8 bg-[#222] rounded text-white">-</button>
        <div className="text-center">
          <span className="text-xl font-bold text-blue-400">{count}</span>
          <span className="text-xs text-gray-500"> / {GOAL} glasses</span>
          <p className="text-xs text-gray-500">{count * 250}ml</p>
        </div>
        <button onClick={() => update(1)} className="w-8 h-8 bg-[#222] rounded text-white">+</button>
      </div>
      <div className="w-full bg-[#222] rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
