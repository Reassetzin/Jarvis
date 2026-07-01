'use client'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'

interface LogEntry { id: string; label: string; time: string }

export function WaterTracker() {
  const [ml, setMl] = useDailyStore('water_ml', 0)
  const [goal, setGoal] = usePersistentStore('water_goal_ml', 3000)
  const [custom, setCustom] = useState('')
  const pct = Math.min(100, (ml / goal) * 100)
  const status = ml >= goal ? '✅ Goal reached!' : ml >= goal * 0.66 ? 'Healthy zone' : ml >= goal * 0.33 ? 'Drink more' : '⚠️ Dehydrated'
  const barColor = ml >= goal ? '#22C55E' : ml >= goal * 0.66 ? '#3B82F6' : ml >= goal * 0.33 ? '#F59E0B' : '#EF4444'
  function addCustom() { const amt = parseInt(custom); if (!isNaN(amt) && amt > 0) { setMl(m => m + amt); setCustom('') } }
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Water · 💧</div>
        <span style={{ fontSize: '0.75rem', color: barColor, fontWeight: 700 }}>{(ml / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L</span>
      </div>
      <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.3s', boxShadow: `0 0 8px ${barColor}80` }} />
      </div>
      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: 8 }}>{status}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <button onClick={() => setMl(m => Math.max(0, m - 250))} style={{ flex: 1, background: '#181818', border: '1px solid #333', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
        <button className="glow-blue" onClick={() => setMl(m => m + 250)} style={{ flex: 1, background: 'transparent', border: '1px solid #3B82F6', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#3B82F6', fontWeight: 700, fontSize: '0.76rem' }}>+250ml</button>
        <button className="glow-blue" onClick={() => setMl(m => m + 500)} style={{ flex: 2, background: '#3B82F6', border: 'none', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.8rem' }}><Plus size={14} /> 500ml</button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="number" placeholder="Custom ml" value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} style={{ flex: 1, fontSize: '0.78rem', padding: '7px 10px' }} />
        <button onClick={addCustom} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>Add</button>
      </div>
    </div>
  )
}

export function AnxietyTracker() {
  const [log, setLog] = useDailyStore<LogEntry[]>('anxiety_log', [])
  function add(label: string) { setLog(l => [...l, { id: Date.now().toString(), label, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]) }
  return (
    <div className="card">
      <div className="section-header">Mood / Anxiety</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => add('Anxious')} style={{ flex: 1, background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 4, padding: '10px', cursor: 'pointer', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700 }}>😰 Anxious</button>
        <button onClick={() => add('Calm')} style={{ flex: 1, background: '#0d1a0d', border: '1px solid #166534', borderRadius: 4, padding: '10px', cursor: 'pointer', color: '#22C55E', fontSize: '0.8rem', fontWeight: 700 }}>😌 Calm</button>
      </div>
      {log.slice().reverse().slice(0, 5).map(e => (
        <div key={e.id} style={{ display: 'flex', gap: 8, fontSize: '0.72rem', color: '#6B7280', padding: '4px 0', borderBottom: '1px solid #111' }}>
          <span style={{ color: e.label === 'Anxious' ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{e.label}</span>
          <span style={{ flex: 1 }} /><span>{e.time}</span>
          <button onClick={() => setLog(l => l.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={11} /></button>
        </div>
      ))}
    </div>
  )
}

const WIN_CATS = ['Mental', 'Physical', 'Work', 'Relationships', 'Habits', 'Self', 'Other']
const CAT_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EC4899', '#8B5CF6', '#F97316', '#6B7280']
interface Win { id: string; text: string; category: string; time: string }

export function WinsTracker() {
  const [wins, setWins] = useDailyStore<Win[]>('wins_today', [])
  const [input, setInput] = useState('')
  const [cat, setCat] = useState('Work')
  function addWin() {
    if (!input.trim()) return
    setWins(w => [...w, { id: Date.now().toString(), text: input.trim(), category: cat, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }])
    setInput('')
  }
  const counts: Record<string, number> = {}
  wins.forEach(w => { counts[w.category] = (counts[w.category] || 0) + 1 })
  return (
    <div className="card">
      <div className="section-header">Wins & Positives</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {WIN_CATS.map((c, i) => counts[c] ? (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#181818', border: '1px solid #222', borderRadius: 12, padding: '3px 8px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[i] }} />
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{c} · {counts[c]}</span>
          </div>
        ) : null)}
      </div>
      <select value={cat} onChange={e => setCat(e.target.value)} style={{ marginBottom: 6 }}>{WIN_CATS.map(c => <option key={c}>{c}</option>)}</select>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input type="text" placeholder="Log a win..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWin()} style={{ flex: 1 }} />
        <button onClick={addWin} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
      </div>
      {wins.slice().reverse().map(w => {
        const ci = WIN_CATS.indexOf(w.category)
        return (
          <div key={w.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[ci] ?? '#6B7280', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.78rem', color: '#E5E7EB' }}>{w.text}</span>
            <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>{w.time}</span>
            <button onClick={() => setWins(ws => ws.filter(x => x.id !== w.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
          </div>
        )
      })}
    </div>
  )
}
