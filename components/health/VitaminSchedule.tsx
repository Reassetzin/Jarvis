'use client'
import { usePersistentStore, useDailyStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'
import { X, Plus, Check, Clock, AlertTriangle } from 'lucide-react'
import { markComplete } from '@/lib/streaks'

interface Vitamin {
  id: string
  name: string
  dose: string
  time: string      // HH:MM
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  notes: string
  running_low: boolean
  days: number[]    // 0=Sun..6=Sat; empty or all = every day
}

const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const
const SLOT_TIMES = { Morning: '6–11 AM', Afternoon: '11 AM–4 PM', Evening: '4–8 PM', Night: '8 PM+' }
const SLOT_COLORS = { Morning: 'var(--accent)', Afternoon: '#22C55E', Evening: '#8B5CF6', Night: '#3B82F6' }
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function VitaminSchedule() {
  const [vits, setVits] = usePersistentStore<Vitamin[]>('vitamins', [])
  const [taken, setTaken] = useDailyStore<string[]>('vitamins_taken', [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', dose: '', time: '08:00', slot: 'Morning' as typeof SLOTS[number], notes: '', running_low: false, days: [] as number[] })

  const todayDow = new Date().getDay()

  function addVit() {
    if (!form.name.trim()) return
    setVits(v => [...v, { ...form, id: Date.now().toString() }])
    setForm({ name: '', dose: '', time: '08:00', slot: 'Morning', notes: '', running_low: false, days: [] })
    setAdding(false)
  }
  function toggle(id: string) { setTaken(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]) }
  function remove(id: string) { setVits(v => v.filter(x => x.id !== id)); setTaken(t => t.filter(x => x !== id)) }
  function toggleLow(id: string) { setVits(v => v.map(x => x.id === id ? { ...x, running_low: !x.running_low } : x)) }

  const scheduledToday = vits.filter(v => !v.days || v.days.length === 0 || v.days.includes(todayDow))
  const groups = SLOTS.map(s => ({ slot: s, items: scheduledToday.filter(v => v.slot === s).sort((a, b) => a.time.localeCompare(b.time)) })).filter(g => g.items.length > 0)
  const takenCount = taken.filter(id => scheduledToday.some(v => v.id === id)).length
  const totalToday = scheduledToday.length

  useEffect(() => { if (totalToday > 0 && takenCount >= totalToday) markComplete('vitamins') }, [takenCount, totalToday])

  function fmt(t: string) {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hh = h % 12 || 12
    return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Vitamin Schedule</div>
        <span style={{ fontSize: '0.7rem', color: takenCount === totalToday && totalToday > 0 ? '#22C55E' : '#6B7280', fontWeight: 700 }}>{takenCount}/{totalToday} taken</span>
      </div>

      {groups.map(g => (
        <div key={g.slot} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: SLOT_COLORS[g.slot] }} />
            <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em' }}>{g.slot.toUpperCase()}</span>
            <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>· {SLOT_TIMES[g.slot]}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {g.items.map(v => {
              const isTaken = taken.includes(v.id)
              return (
                <div key={v.id} onClick={() => toggle(v.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isTaken ? '#0d1a0d' : '#181818',
                  border: `1px solid ${isTaken ? '#15391590' : '#222'}`,
                  borderRadius: 4, padding: '10px 12px', cursor: 'pointer',
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${isTaken ? '#22C55E' : '#374151'}`, background: isTaken ? '#22C55E' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isTaken && <Check size={10} color="#000" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: isTaken ? '#4B5563' : '#F3F4F6', textDecoration: isTaken ? 'line-through' : 'none' }}>{v.name}</div>
                    <div style={{ fontSize: '0.62rem', color: '#6B7280', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Clock size={9} /> {fmt(v.time)}{v.dose && ` · ${v.dose}`}
                    </div>
                  </div>
                  {v.running_low && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#2d1500', border: '1px solid #7c2d12', borderRadius: 3, padding: '2px 6px' }}>
                      <AlertTriangle size={10} color="#F97316" /><span style={{ fontSize: '0.58rem', color: '#F97316', fontWeight: 600 }}>LOW</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); toggleLow(v.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.7rem' }}>⚠</button>
                  <button onClick={e => { e.stopPropagation(); remove(v.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {vits.length === 0 && !adding && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No vitamins scheduled yet.</div>}

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, padding: 12, background: '#181818', borderRadius: 4 }}>
          <input type="text" placeholder="Name (e.g. Vitamin D3)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Dose (e.g. 2000 IU)" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} style={{ flex: 2 }} />
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <select value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value as any }))}>
            {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 5 }}>Days (none selected = every day)</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {DOW.map((d, i) => {
                const on = form.days.includes(i)
                return (
                  <button key={i} type="button" onClick={() => setForm(f => ({ ...f, days: on ? f.days.filter(x => x !== i) : [...f.days, i] }))} style={{
                    flex: 1, aspectRatio: '1', borderRadius: 4, cursor: 'pointer',
                    background: on ? '#1a0a00' : '#181818', border: `1px solid ${on ? 'var(--accent)' : '#333'}`,
                    color: on ? 'var(--accent)' : '#6B7280', fontWeight: on ? 700 : 400, fontSize: '0.72rem',
                  }}>{d}</button>
                )
              })}
            </div>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: '#9CA3AF' }}>
            <input type="checkbox" checked={form.running_low} onChange={e => setForm(f => ({ ...f, running_low: e.target.checked }))} style={{ width: 'auto' }} /> Running low
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addVit} className="btn-amber" style={{ flex: 1 }}>Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Plus size={13} /> Add Vitamin / Medicine
        </button>
      )}
    </div>
  )
}
