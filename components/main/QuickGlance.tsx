'use client'
import { usePersistentStore, useDailyStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Check, Plus, Minus } from 'lucide-react'

interface Vitamin { id: string; name: string; slot: string }

export function VitaminsMini() {
  const [vits] = usePersistentStore<Vitamin[]>('vitamins', [])
  const [taken, setTaken] = useDailyStore<string[]>('vitamins_taken', [])
  const takenCount = taken.filter(id => vits.some(v => v.id === id)).length
  function toggle(id: string) { setTaken(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]) }
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Vitamins</div>
        </div>
        <span style={{ fontSize: '0.7rem', color: takenCount === vits.length && vits.length > 0 ? '#22C55E' : '#6B7280' }}>{takenCount}/{vits.length}</span>
      </div>
      {vits.length === 0 ? (
        <div style={{ fontSize: '0.76rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>No vitamins yet.<br />Add them in Health.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {vits.map(v => {
            const isTaken = taken.includes(v.id)
            return (
              <div key={v.id} onClick={() => toggle(v.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: isTaken ? '#0d1a0d' : '#181818', border: `1px solid ${isTaken ? '#15391590' : '#222'}`, borderRadius: 4, padding: '8px 10px', cursor: 'pointer' }}>
                <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${isTaken ? '#22C55E' : '#374151'}`, background: isTaken ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isTaken && <Check size={9} color="#000" strokeWidth={3} />}
                </div>
                <span style={{ flex: 1, fontSize: '0.78rem', color: isTaken ? '#4B5563' : '#E5E7EB', textDecoration: isTaken ? 'line-through' : 'none' }}>{v.name}</span>
                <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>{v.slot}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function WaterMini() {
  const [ml, setMl] = useDailyStore('water_ml', 0)
  const [goal, setGoal] = usePersistentStore('water_goal_ml', 3000)
  const [custom, setCustom] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const pct = Math.min(100, (ml / goal) * 100)
  const color = ml >= goal ? '#22C55E' : ml >= goal * 0.66 ? '#3B82F6' : ml >= goal * 0.33 ? '#F59E0B' : '#EF4444'

  function addCustom() {
    const amt = parseInt(custom)
    if (!isNaN(amt) && amt > 0) { setMl(m => m + amt); setCustom('') }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Water</div>
        <span style={{ fontSize: '0.85rem', color, fontWeight: 700 }}>{(ml / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L</span>
      </div>
      <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s', boxShadow: `0 0 8px ${color}80` }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <button onClick={() => setMl(m => Math.max(0, m - 250))} style={{ flex: 1, background: '#181818', border: '1px solid #333', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
        <button className="glow-blue" onClick={() => setMl(m => m + 250)} style={{ flex: 1, background: 'transparent', border: '1px solid #3B82F6', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#3B82F6', fontWeight: 700, fontSize: '0.78rem' }}>+250ml</button>
        <button className="glow-blue" onClick={() => setMl(m => m + 500)} style={{ flex: 2, background: '#3B82F6', border: 'none', borderRadius: 4, padding: '9px', cursor: 'pointer', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.82rem' }}><Plus size={14} /> 500ml</button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="number" placeholder="Custom ml" value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} style={{ flex: 1, fontSize: '0.78rem', padding: '7px 10px' }} />
        <button onClick={addCustom} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>Add</button>
      </div>
      {editingGoal ? (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input type="number" placeholder="Goal in ml (e.g. 3000)" value={goalInput} onChange={e => setGoalInput(e.target.value)} style={{ flex: 1, fontSize: '0.72rem', padding: '6px 10px' }} />
          <button onClick={() => { const g = parseInt(goalInput); if (g > 0) setGoal(g); setEditingGoal(false) }} className="btn-amber" style={{ width: 'auto', padding: '6px 14px' }}>Set</button>
        </div>
      ) : (
        <button onClick={() => { setGoalInput(goal.toString()); setEditingGoal(true) }} style={{ background: 'none', border: 'none', color: '#4B5563', fontSize: '0.65rem', cursor: 'pointer', marginTop: 6, width: '100%', textAlign: 'center' }}>Goal: {(goal / 1000).toFixed(1)}L · edit</button>
      )}
    </div>
  )
}
