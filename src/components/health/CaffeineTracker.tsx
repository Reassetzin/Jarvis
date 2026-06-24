'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface CaffeineEntry {
  id: string
  source: string
  mg: number
  time: string
}

export default function CaffeineTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, CaffeineEntry[]>>({})
  const [source, setSource] = useState('Coffee')
  const [mg, setMg] = useState('100')

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_caffeine')
    if (raw) setLogs(JSON.parse(raw) as Record<string, CaffeineEntry[]>)
  }, [])

  const todayEntries = logs[today] || []
  const total = todayEntries.reduce((s, e) => s + e.mg, 0)

  const add = () => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const entry: CaffeineEntry = { id: newId(), source, mg: Number(mg), time }
    const updated = { ...logs, [today]: [...todayEntries, entry] }
    setLogs(updated)
    localStorage.setItem('jarvis_caffeine', JSON.stringify(updated))
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="card">
      <div className="section-header">CAFFEINE — {total}mg {total > 400 && <span className="text-red-400">!! Over limit</span>}</div>
      {todayEntries.map(e => (
        <div key={e.id} className="flex justify-between text-xs py-1 border-b border-[#1a1a1a]">
          <span className="text-gray-300">{e.source}</span>
          <span className="text-gray-500">{e.time}</span>
          <span className="text-brand">{e.mg}mg</span>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <select className={inp} value={source} onChange={e => setSource(e.target.value)}>
          <option>Coffee</option>
          <option>Espresso</option>
          <option>Energy Drink</option>
          <option>Pre-workout</option>
          <option>Tea</option>
          <option>Other</option>
        </select>
        <input className={`${inp} w-20`} type="number" value={mg} onChange={e => setMg(e.target.value)} placeholder="mg" />
        <button onClick={add} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
      </div>
    </div>
  )
}
