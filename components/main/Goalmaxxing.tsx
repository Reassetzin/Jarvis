'use client'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Zap, X, Check, ChevronRight } from 'lucide-react'

interface Goal {
  id: string
  text: string
  priority: boolean
  done: boolean
  date: string
}

function todayStr() {
  const now = new Date()
  if (now.getHours() < 6) {
    const y = new Date(now); y.setDate(y.getDate() - 1)
    return y.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

function tomorrowStr() {
  const now = new Date()
  const base = now.getHours() < 6 ? now : now
  const t = new Date(base); t.setDate(t.getDate() + 1)
  return t.toISOString().split('T')[0]
}

export default function Goalmaxxing() {
  const [goals, setGoals] = useDailyStore<Goal[]>('goals_today', [])
  const [tomorrowGoals, setTomorrowGoals] = usePersistentStore<Goal[]>('goals_tomorrow', [])
  const [streak, setStreak] = usePersistentStore('goal_streak', 0)
  const [input, setInput] = useState('')
  const [tmInput, setTmInput] = useState('')
  const [priority, setPriority] = useState(false)

  const isPast9 = new Date().getHours() >= 21

  const done = goals.filter(g => g.done).length
  const total = goals.length

  function addGoal() {
    if (!input.trim()) return
    setGoals(gs => [...gs, {
      id: Date.now().toString(), text: input.trim(),
      priority, done: false, date: todayStr()
    }])
    setInput(''); setPriority(false)
  }

  function toggleGoal(id: string) {
    setGoals(gs => gs.map(g => g.id === id ? { ...g, done: !g.done } : g))
  }

  function deleteGoal(id: string) {
    setGoals(gs => gs.filter(g => g.id !== id))
  }

  function pushRemaining() {
    const remaining = goals.filter(g => !g.done)
    const pushed = remaining.map(g => ({ ...g, id: Date.now().toString() + Math.random(), date: tomorrowStr() }))
    setTomorrowGoals(gs => [...gs, ...pushed])
    alert(`Pushed ${pushed.length} goal(s) to tomorrow.`)
  }

  function addTomorrow() {
    if (!tmInput.trim()) return
    setTomorrowGoals(gs => [...gs, {
      id: Date.now().toString(), text: tmInput.trim(),
      priority: false, done: false, date: tomorrowStr()
    }])
    setTmInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Goalmaxxing</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{done}/{total} done</span>
            {streak > 0 && (
              <span style={{ fontSize: '0.65rem', background: '#1a0a00', border: '1px solid #92400E', borderRadius: 4, padding: '2px 7px', color: '#F59E0B', fontWeight: 700 }}>
                🔥 {streak}d
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {goals.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>
              No goals yet. Add one below.
            </div>
          )}
          {goals.map(g => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: g.done ? '#0d1a0d' : '#111',
              border: `1px solid ${g.done ? '#15391590' : '#222'}`,
              borderRadius: 4, padding: '10px 12px',
            }}>
              <button onClick={() => toggleGoal(g.id)} style={{
                width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${g.done ? '#22C55E' : '#374151'}`,
                background: g.done ? '#22C55E' : 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {g.done && <Check size={11} color="#000" strokeWidth={3} />}
              </button>
              {g.priority && <Zap size={13} color="#F59E0B" fill="#F59E0B" />}
              <span style={{
                flex: 1, fontSize: '0.82rem', color: g.done ? '#4B5563' : '#F3F4F6',
                textDecoration: g.done ? 'line-through' : 'none',
              }}>{g.text}</span>
              <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button onClick={() => setPriority(p => !p)} style={{
            background: priority ? '#1a0a00' : 'transparent',
            border: `1px solid ${priority ? '#F59E0B' : '#374151'}`,
            borderRadius: 4, padding: '8px 10px', cursor: 'pointer', flexShrink: 0,
          }}>
            <Zap size={14} color={priority ? '#F59E0B' : '#374151'} fill={priority ? '#F59E0B' : 'none'} />
          </button>
          <input
            type="text" placeholder="Add today's goal..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            style={{ flex: 1 }}
          />
          <button onClick={addGoal} style={{
            background: '#F59E0B', color: '#000', fontWeight: 700, borderRadius: 4,
            padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0,
          }}>+</button>
        </div>

        {goals.filter(g => !g.done).length > 0 && (
          <button onClick={pushRemaining} className="btn-ghost" style={{ width: '100%', fontSize: '0.75rem' }}>
            Push remaining to tomorrow <ChevronRight size={12} style={{ display: 'inline' }} />
          </button>
        )}
      </div>

      <div className="card" style={{ opacity: isPast9 ? 1 : 0.4, position: 'relative' }}>
        <div className="section-header">Plan Tomorrow</div>
        {!isPast9 && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', color: '#6B7280',
          }}>
            Unlocks at 9 PM
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {tomorrowGoals.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '9px 12px' }}>
              <span style={{ flex: 1, fontSize: '0.82rem' }}>{g.text}</span>
              <button onClick={() => setTomorrowGoals(gs => gs.filter(x => x.id !== g.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="text" placeholder="Tomorrow's goal..." value={tmInput}
            onChange={e => setTmInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTomorrow()}
            style={{ flex: 1 }} disabled={!isPast9} />
          <button onClick={addTomorrow} disabled={!isPast9} style={{
            background: '#F59E0B', color: '#000', fontWeight: 700, borderRadius: 4,
            padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
            opacity: isPast9 ? 1 : 0.5,
          }}>+</button>
        </div>
      </div>
    </div>
  )
}
