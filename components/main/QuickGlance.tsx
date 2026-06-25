'use client'
import { usePersistentStore, useDailyStore } from '@/hooks/useStore'
import { Check, Pill, Droplet, Plus, Minus } from 'lucide-react'

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
          <Pill size={13} color="#22C55E" />
          <div className="section-header" style={{ marginBottom: 0, borderLeft: 'none', paddingLeft: 0 }}>Vitamins</div>
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
  const [count, setCount] = useDailyStore('water_count', 0)
  const goal = 9
  const pct = Math.min(100, (count / goal) * 100)
  const color = count >= goal ? '#22C55E' : count >= 6 ? '#3B82F6' : count >= 3 ? '#F59E0B' : '#EF4444'
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Droplet size={13} color="#3B82F6" />
          <div className="section-header" style={{ marginBottom: 0, borderLeft: 'none', paddingLeft: 0 }}>Water</div>
        </div>
        <span style={{ fontSize: '0.85rem', color, fontWeight: 700 }}>{count}/{goal}</span>
      </div>
      <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setCount(c => Math.max(0, c - 1))} style={{ flex: 1, background: '#181818', border: '1px solid #333', borderRadius: 4, padding: '8px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
        <button onClick={() => setCount(c => c + 1)} style={{ flex: 2, background: '#3B82F6', border: 'none', borderRadius: 4, padding: '8px', cursor: 'pointer', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Plus size={14} /> Bottle</button>
      </div>
    </div>
  )
}
