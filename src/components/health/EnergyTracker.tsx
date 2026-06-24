'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

interface EnergyLog {
  level: 'high' | 'low'
  time: string
}

export default function EnergyTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, EnergyLog[]>>({})

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_energy')
    if (raw) setLogs(JSON.parse(raw) as Record<string, EnergyLog[]>)
  }, [])

  const todayLogs = logs[today] || []

  const log = (level: 'high' | 'low') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...logs, [today]: [...todayLogs, { level, time }] }
    setLogs(updated)
    localStorage.setItem('jarvis_energy', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">ENERGY</div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => log('high')} className="px-3 py-1.5 bg-green-900 text-green-300 text-xs rounded font-semibold">⚡ High</button>
        <button onClick={() => log('low')} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded font-semibold">💤 Low</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {todayLogs.map((l, i) => (
          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${l.level === 'high' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
            {l.level} {l.time}
          </span>
        ))}
      </div>
    </div>
  )
}
