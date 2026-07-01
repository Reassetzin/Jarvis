'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'

interface WatchData {
  steps: number; sleep: number; restingHR: number; activeCals: number; lastUpdated: string | null
}
const DEFAULT: WatchData = { steps: 0, sleep: 0, restingHR: 0, activeCals: 0, lastUpdated: null }

export default function WatchStats() {
  const [data, setData] = usePersistentStore<WatchData>('watch_data', DEFAULT)
  const [form, setForm] = useState({ ...DEFAULT })
  const [editing, setEditing] = useState(false)

  const stepGoal = 8000
  const stepPct = Math.min(100, (data.steps / stepGoal) * 100)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Nothing Watch · Daily</div>
        {data.lastUpdated && <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>Updated {new Date(data.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Steps', value: data.steps.toLocaleString(), color: 'var(--accent)', sub: `goal ${stepGoal.toLocaleString()}` },
          { label: 'Sleep', value: data.sleep ? `${data.sleep}h` : '--', color: '#8B5CF6', sub: 'last night' },
          { label: 'Resting HR', value: data.restingHR ? `${data.restingHR}` : '--', color: '#22C55E', sub: 'bpm' },
          { label: 'Active Cal', value: data.activeCals ? `${data.activeCals}` : '--', color: '#EF4444', sub: 'burned' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.55rem', color: '#374151' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {data.steps > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 6, background: '#1f1f1f', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stepPct}%`, background: stepPct >= 100 ? '#22C55E' : 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {!editing ? (
        <button onClick={() => { setForm({ ...data }); setEditing(true) }} className="btn-ghost" style={{ width: '100%' }}>Update from Watch</button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { key: 'steps', label: 'Steps' }, { key: 'sleep', label: 'Sleep (h)' },
            { key: 'restingHR', label: 'Resting HR' }, { key: 'activeCals', label: 'Active Cal' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 3 }}>{f.label}</div>
              <input type="number" step={f.key === 'sleep' ? 0.5 : 1} value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: Number(e.target.value) }))} />
            </div>
          ))}
          <button onClick={() => { setData({ ...form, lastUpdated: new Date().toISOString() }); setEditing(false) }} className="btn-amber">Save</button>
          <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
        </div>
      )}
      <p style={{ fontSize: '0.6rem', color: '#374151', marginTop: 10, lineHeight: 1.5 }}>
        Enter stats from your Nothing Watch's companion app. Auto-sync can be added later if you switch to a watch with an open API.
      </p>
    </div>
  )
}
