'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface Win {
  id: string
  category: string
  content: string
}

const CATEGORIES = ['Work', 'Health', 'Personal', 'Brand', 'Finance', 'Other']

export default function WinsTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, Win[]>>({})
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Work')

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_wins')
    if (raw) setLogs(JSON.parse(raw) as Record<string, Win[]>)
  }, [])

  const todayWins = logs[today] || []

  const add = () => {
    if (!content.trim()) return
    const win: Win = { id: newId(), category, content }
    const updated = { ...logs, [today]: [...todayWins, win] }
    setLogs(updated)
    localStorage.setItem('jarvis_wins', JSON.stringify(updated))
    setContent('')
  }

  const del = (id: string) => {
    const updated = { ...logs, [today]: todayWins.filter(w => w.id !== id) }
    setLogs(updated)
    localStorage.setItem('jarvis_wins', JSON.stringify(updated))
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="card">
      <div className="section-header">WINS</div>
      {todayWins.map(w => (
        <div key={w.id} className="flex items-start gap-2 py-1.5 border-b border-[#1a1a1a]">
          <span className="text-[10px] px-1.5 py-0.5 bg-brand text-black rounded">{w.category}</span>
          <span className="flex-1 text-xs text-gray-300">{w.content}</span>
          <button onClick={() => del(w.id)} className="text-red-500 text-xs">✕</button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <select className={inp} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className={`${inp} flex-1`} placeholder="Win..." value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <button onClick={add} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
      </div>
    </div>
  )
}
