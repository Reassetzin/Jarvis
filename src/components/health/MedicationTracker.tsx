'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

interface MedLog {
  taken: boolean
  time: string
}

export default function MedicationTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, MedLog>>({})

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_medication')
    if (raw) setLogs(JSON.parse(raw) as Record<string, MedLog>)
  }, [])

  const todayLog = logs[today]

  const logMed = () => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...logs, [today]: { taken: true, time } }
    setLogs(updated)
    localStorage.setItem('jarvis_medication', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">CONCERTA</div>
      {todayLog?.taken ? (
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-lg">✓</span>
          <span className="text-sm text-gray-300">Taken at {todayLog.time}</span>
        </div>
      ) : (
        <button onClick={logMed} className="px-4 py-2 bg-brand text-black text-sm font-bold rounded">
          Log Concerta
        </button>
      )}
    </div>
  )
}
