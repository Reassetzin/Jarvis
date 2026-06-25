'use client'
import { usePersistentStore, useDailyStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, AlertTriangle, Plus } from 'lucide-react'

interface Supplement {
  id: string
  name: string
  dose: string
  notes: string
  time_of_day: 'Morning' | 'Lunch' | 'Evening'
  running_low: boolean
}

const TIME_LABELS = {
  Morning: '6:00 – 10:00 AM',
  Lunch: '12:00 – 1:00 PM',
  Evening: '6:00 – 9:00 PM',
}

export default function SupplementTracker() {
  const [supps, setSupps] = usePersistentStore<Supplement[]>('supplements', [])
  const [taken, setTaken] = useDailyStore<string[]>('supps_taken', [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', dose: '', notes: '', time_of_day: 'Morning' as 'Morning' | 'Lunch' | 'Evening', running_low: false })

  const groups = (['Morning', 'Lunch', 'Evening'] as const).map(t => ({
    time: t, items: supps.filter(s => s.time_of_day === t)
  })).filter(g => g.items.length > 0)

  function toggleTaken(id: string) {
    setTaken(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id])
  }

  function addSupp() {
    if (!form.name.trim()) return
    setSupps(s => [...s, { ...form, id: Date.now().toString() }])
    setForm({ name: '', dose: '', notes: '', time_of_day: 'Morning', running_low: false })
    setAdding(false)
  }

  function removeSupp(id: string) {
    setSupps(s => s.filter(x => x.id !== id))
    setTaken(t => t.filter(x => x !== id))
  }

  function toggleLow(id: string) {
    setSupps(s => s.map(x => x.id === id ? { ...x, running_low: !x.running_low } : x))
  }

  const totalTaken = taken.filter(id => supps.some(s => s.id === id)).length

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Daily Stack</div>
        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{totalTaken}/{supps.length} taken</span>
      </div>

      {groups.map(g => (
        <div key={g.time} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>
            {g.time} · {TIME_LABELS[g.time]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {g.items.map(s => {
              const isTaken = taken.includes(s.id)
              return (
                <div key={s.id} onClick={() => toggleTaken(s.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isTaken ? '#0d1a0d' : '#181818',
                  border: `1px solid ${isTaken ? '#15391590' : '#222'}`,
                  borderRadius: 4, padding: '10px 12px', cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${isTaken ? '#22C55E' : '#374151'}`,
                    background: isTaken ? '#22C55E' : 'transparent',
                    flexShrink: 0, transition: 'all 0.15s',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: isTaken ? '#4B5563' : '#F3F4F6', textDecoration: isTaken ? 'line-through' : 'none' }}>
                      {s.name}
                    </div>
                    {s.dose && <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>{s.dose}</div>}
                  </div>
                  {s.running_low && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#2d1500', border: '1px solid #7c2d12', borderRadius: 3, padding: '2px 6px' }}>
                      <AlertTriangle size={10} color="#F97316" />
                      <span style={{ fontSize: '0.6rem', color: '#F97316', fontWeight: 600 }}>LOW</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); toggleLow(s.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.6rem' }}>
                    ⚠
                  </button>
                  <button onClick={e => { e.stopPropagation(); removeSupp(s.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {supps.length === 0 && !adding && (
        <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>
          No supplements added yet.
        </div>
      )}

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, padding: 12, background: '#181818', borderRadius: 4 }}>
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input type="text" placeholder="Dose (e.g. 500mg)" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} />
          <input type="text" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <select value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value as any }))}>
            <option value="Morning">Morning</option>
            <option value="Lunch">Lunch</option>
            <option value="Evening">Evening</option>
          </select>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: '#9CA3AF' }}>
            <input type="checkbox" checked={form.running_low} onChange={e => setForm(f => ({ ...f, running_low: e.target.checked }))} />
            Running low
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addSupp} className="btn-amber" style={{ flex: 1 }}>Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Plus size={13} /> Add Supplement
        </button>
      )}
    </div>
  )
}
