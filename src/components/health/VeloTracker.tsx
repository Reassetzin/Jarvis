'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

export default function VeloTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, number>>({})

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_velo')
    if (raw) setLogs(JSON.parse(raw) as Record<string, number>)
  }, [])

  const count = logs[today] || 0

  const update = (delta: number) => {
    const updated = { ...logs, [today]: Math.max(0, count + delta) }
    setLogs(updated)
    localStorage.setItem('jarvis_velo', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">VELO</div>
      <div className="flex items-center gap-3">
        <button onClick={() => update(-1)} className="w-8 h-8 bg-[#222] rounded text-white text-lg">-</button>
        <span className={`text-2xl font-bold ${count > 5 ? 'text-red-400' : count > 3 ? 'text-yellow-400' : 'text-white'}`}>{count}</span>
        <button onClick={() => update(1)} className="w-8 h-8 bg-[#222] rounded text-white text-lg">+</button>
        {count > 5 && <span className="text-xs text-red-400">!! High</span>}
        {count > 3 && count <= 5 && <span className="text-xs text-yellow-400">! Moderate</span>}
      </div>
    </div>
  )
}
