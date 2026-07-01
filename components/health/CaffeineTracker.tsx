'use client'
import { useDailyStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X } from 'lucide-react'

interface CafEntry { id: string; label: string; mg: number; time: string }

const PRESETS = [
  { label: 'Monster', mg: 160 },
  { label: 'Espresso', mg: 128 },
  { label: 'Coffee', mg: 95 },
  { label: '2x Espr', mg: 248 },
]

function getBarColor(total: number) {
  if (total <= 250) return '#22C55E'
  if (total <= 300) return '#EAB308'
  if (total <= 400) return '#F97316'
  return '#EF4444'
}

function getBarLabel(total: number) {
  if (total <= 250) return 'Safe zone'
  if (total <= 300) return 'Caution'
  if (total <= 400) return 'Warning'
  return 'Ceiling hit'
}

export default function CaffeineTracker() {
  const [log, setLog] = useDailyStore<CafEntry[]>('caffeine_log', [])
  const [custom, setCustom] = useState('')

  const now = new Date()
  const isPastCutoff = now.getHours() >= 12
  const total = log.reduce((a, e) => a + e.mg, 0)
  const barColor = getBarColor(total)
  const pct = Math.min(100, (total / 400) * 100)

  function addEntry(label: string, mg: number) {
    if (isPastCutoff) return
    setLog(l => [...l, { id: Date.now().toString(), label, mg, time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }])
  }

  function addCustom() {
    const mg = parseInt(custom)
    if (!mg || isNaN(mg)) return
    addEntry(`Custom`, mg)
    setCustom('')
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Caffeine</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: barColor }}>{total}mg</div>
      </div>

      {isPastCutoff && (
        <div style={{ background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 4, padding: '8px 12px', marginBottom: 10, fontSize: '0.75rem', color: '#EF4444' }}>
          ⛔ Past cutoff. No caffeine today.
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>
          <span>{getBarLabel(total)}</span><span>400mg ceiling</span>
        </div>
        <div style={{ height: 6, background: '#1f1f1f', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s ease, background 0.3s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => addEntry(p.label, p.mg)} disabled={isPastCutoff}
            className="btn-ghost" style={{ opacity: isPastCutoff ? 0.3 : 1 }}>
            {p.label} · {p.mg}mg
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input type="number" placeholder="Custom mg" value={custom}
          onChange={e => setCustom(e.target.value)} disabled={isPastCutoff}
          style={{ flex: 1, opacity: isPastCutoff ? 0.3 : 1 }} />
        <button onClick={addCustom} disabled={isPastCutoff} style={{
          background: isPastCutoff ? '#1f1f1f' : 'var(--accent)', color: '#000', fontWeight: 700,
          borderRadius: 4, padding: '0 14px', border: 'none', cursor: 'pointer',
          opacity: isPastCutoff ? 0.3 : 1,
        }}>+</button>
      </div>

      {log.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {log.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#9CA3AF' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{e.mg}mg</span>
              <span style={{ flex: 1 }}>{e.label}</span>
              <span style={{ color: '#4B5563' }}>{e.time}</span>
              <button onClick={() => setLog(l => l.filter(x => x.id !== e.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
