'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

interface AnxietyLog {
  level: 'high' | 'calm'
  time: string
}

export default function AnxietyTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, AnxietyLog[]>>({})

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_anxiety')
    if (raw) setLogs(JSON.parse(raw) as Record<string, AnxietyLog[]>)
  }, [])

  const todayLogs = logs[today] || []

  const log = (level: 'high' | 'calm') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...logs, [today]: [...todayLogs, { level, time }] }
    setLogs(updated)
    localStorage.setItem('jarvis_anxiety', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">ANXIETY</div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => log('high')} className="px-3 py-1.5 bg-red-900 text-red-300 text-xs rounded font-semibold">😰 High</button>
        <button onClick={() => log('calm')} className="px-3 py-1.5 bg-blue-900 text-blue-300 text-xs rounded font-semibold">😌 Calm</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {todayLogs.map((l, i) => (
          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${l.level === 'high' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
            {l.level} {l.time}
          </span>
        ))}
      </div>
    </div>
  )
}
