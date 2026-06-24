'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import DayProgressRing from '@/components/DayProgressRing'
import { getLocalDate } from '@/lib/utils'

interface Goal {
  id: string
  title: string
  completed: boolean
  is_tomorrow: boolean
  date: string
  streak: number
}

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

export default function MainTab() {
  const today = getLocalDate()
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [newTomGoal, setNewTomGoal] = useState('')
  const [overseerMsg, setOverseerMsg] = useState('')
  const [overseerResp, setOverseerResp] = useState('')
  const [overseerLoading, setOverseerLoading] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_goals')
    if (raw) setGoals(JSON.parse(raw) as Goal[])
  }, [])

  const save = (updated: Goal[]) => {
    setGoals(updated)
    localStorage.setItem('jarvis_goals', JSON.stringify(updated))
  }

  const todayGoals = goals.filter(g => !g.is_tomorrow && g.date === today)
  const tomGoals = goals.filter(g => g.is_tomorrow && g.date === today)

  const addGoal = (isTomorrow: boolean) => {
    const title = isTomorrow ? newTomGoal.trim() : newGoal.trim()
    if (!title) return
    const g: Goal = { id: newId(), title, completed: false, is_tomorrow: isTomorrow, date: today, streak: 0 }
    save([...goals, g])
    isTomorrow ? setNewTomGoal('') : setNewGoal('')
  }

  const toggleGoal = (id: string) => {
    save(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }

  const deleteGoal = (id: string) => {
    save(goals.filter(g => g.id !== id))
  }

  const sendOverseer = async () => {
    if (!overseerMsg.trim()) return
    setOverseerLoading(true)
    try {
      const res = await fetch('/api/overseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: overseerMsg, context: { date: today, goals: todayGoals } }),
      })
      const data = await res.json() as { response?: string; error?: string }
      setOverseerResp(data.response || data.error || 'Error')
    } catch {
      setOverseerResp('Failed to connect')
    }
    setOverseerLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <TopBar />
      <DayProgressRing />

      <div className="card">
        <div className="section-header">OVERSEER</div>
        <textarea
          className="w-full bg-black border border-[#333] rounded p-2 text-sm text-white resize-none"
          rows={3}
          placeholder="Ask Jarvis anything..."
          value={overseerMsg}
          onChange={e => setOverseerMsg(e.target.value)}
        />
        <button
          onClick={sendOverseer}
          disabled={overseerLoading}
          className="mt-2 px-4 py-1.5 bg-brand text-black text-xs font-semibold rounded disabled:opacity-50"
        >
          {overseerLoading ? 'Thinking...' : 'Send'}
        </button>
        {overseerResp && (
          <p className="mt-2 text-xs text-gray-300 whitespace-pre-wrap">{overseerResp}</p>
        )}
      </div>

      <div className="card">
        <div className="section-header">GOALMAXXING — TODAY</div>
        {todayGoals.map(g => (
          <div key={g.id} className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={g.completed} onChange={() => toggleGoal(g.id)} className="accent-brand" />
            <span className={`flex-1 text-sm ${g.completed ? 'line-through text-gray-600' : 'text-white'}`}>{g.title}</span>
            {g.streak > 0 && <span className="text-xs text-brand">🔥{g.streak}</span>}
            <button onClick={() => deleteGoal(g.id)} className="text-red-500 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 bg-black border border-[#333] rounded px-2 py-1 text-sm text-white"
            placeholder="Add goal..."
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal(false)}
          />
          <button onClick={() => addGoal(false)} className="px-3 py-1 bg-brand text-black text-xs font-semibold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">PLAN TOMORROW</div>
        {tomGoals.map(g => (
          <div key={g.id} className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={g.completed} onChange={() => toggleGoal(g.id)} className="accent-brand" />
            <span className={`flex-1 text-sm ${g.completed ? 'line-through text-gray-600' : 'text-white'}`}>{g.title}</span>
            <button onClick={() => deleteGoal(g.id)} className="text-red-500 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 bg-black border border-[#333] rounded px-2 py-1 text-sm text-white"
            placeholder="Add tomorrow goal..."
            value={newTomGoal}
            onChange={e => setNewTomGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal(true)}
          />
          <button onClick={() => addGoal(true)} className="px-3 py-1 bg-brand text-black text-xs font-semibold rounded">+</button>
        </div>
      </div>
    </div>
  )
}
