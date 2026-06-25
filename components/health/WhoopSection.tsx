'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface WhoopData {
  recovery: number; sleep: number; strain: number
  hrv: number; rhr: number; skinTemp: number; bloodO2: number; respRate: number
  lastUpdated: string | null
}

const DEFAULT: WhoopData = { recovery: 0, sleep: 0, strain: 0, hrv: 0, rhr: 0, skinTemp: 0, bloodO2: 0, respRate: 0, lastUpdated: null }

function RecoveryRing({ pct }: { pct: number }) {
  const color = pct >= 67 ? '#22C55E' : pct >= 34 ? '#F59E0B' : '#EF4444'
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1f1f1f" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="50" y="54" textAnchor="middle" fill={color} fontSize="18" fontWeight="800">{pct}%</text>
    </svg>
  )
}

export default function WhoopSection() {
  const [data, setData] = usePersistentStore<WhoopData>('whoop', DEFAULT)
  const [form, setForm] = useState({ ...DEFAULT })
  const [editing, setEditing] = useState(false)
  const [aiCall, setAiCall] = useState<{ text: string; level: string } | null>(null)
  const [loading, setLoading] = useState(false)

  function saveData() {
    setData({ ...form, lastUpdated: new Date().toISOString() })
    setEditing(false)
  }

  async function getAICall() {
    setLoading(true)
    try {
      const res = await fetch('/api/whoop-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whoop: data }),
      })
      const d = await res.json()
      setAiCall(d)
    } catch {
      setAiCall({ text: 'Failed to get AI call. Check your API key.', level: 'YELLOW' })
    } finally {
      setLoading(false)
    }
  }

  const color = data.recovery >= 67 ? '#22C55E' : data.recovery >= 34 ? '#F59E0B' : '#EF4444'
  const levelColor = aiCall?.level === 'GREEN' ? '#22C55E' : aiCall?.level === 'RED' ? '#EF4444' : '#F59E0B'

  const fields = [
    { key: 'recovery', label: 'Recovery %', max: 100 },
    { key: 'sleep', label: 'Sleep %', max: 100 },
    { key: 'strain', label: 'Strain', max: 21 },
    { key: 'hrv', label: 'HRV (ms)', max: 200 },
    { key: 'rhr', label: 'RHR (bpm)', max: 120 },
    { key: 'skinTemp', label: 'Skin Temp (°F)', max: 105 },
    { key: 'bloodO2', label: 'Blood O2 %', max: 100 },
    { key: 'respRate', label: 'Resp Rate', max: 30 },
  ] as const

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>WHOOP</div>
        {data.lastUpdated && (
          <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>
            Updated {new Date(data.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <RecoveryRing pct={data.recovery} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Sleep', value: `${data.sleep}%`, color: '#9CA3AF' },
            { label: 'Strain', value: data.strain.toFixed(1), color: '#9CA3AF' },
            { label: 'HRV', value: `${data.hrv}ms`, color: '#22C55E' },
            { label: 'RHR', value: `${data.rhr}bpm`, color: '#9CA3AF' },
            { label: 'SpO2', value: `${data.bloodO2}%`, color: '#3B82F6' },
            { label: 'Resp', value: `${data.respRate}/min`, color: '#9CA3AF' },
          ].map(s => (
            <div key={s.label} style={{ background: '#181818', borderRadius: 4, padding: '6px 8px' }}>
              <div style={{ fontSize: '0.58rem', color: '#4B5563', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color }}>{s.value || '--'}</div>
            </div>
          ))}
        </div>
      </div>

      {!editing ? (
        <button onClick={() => { setForm({ ...data }); setEditing(true) }} className="btn-ghost" style={{ width: '100%', marginBottom: 8 }}>
          Update Stats
        </button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 3 }}>{f.label}</div>
              <input type="number" value={(form as any)[f.key]} step={f.key === 'strain' ? 0.1 : 1}
                onChange={e => setForm(x => ({ ...x, [f.key]: Number(e.target.value) }))} />
            </div>
          ))}
          <button onClick={saveData} className="btn-amber">Save</button>
          <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
        </div>
      )}

      <button onClick={getAICall} disabled={loading} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: '#111', border: '1px solid #333', borderRadius: 4,
        padding: '10px', width: '100%', cursor: 'pointer', color: '#9CA3AF', fontSize: '0.8rem',
      }}>
        <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        {loading ? 'Getting AI call...' : "Get Today's Call"}
      </button>

      {aiCall && (
        <div style={{ marginTop: 10, background: '#181818', border: `1px solid ${levelColor}33`, borderRadius: 4, padding: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${levelColor}15`, border: `1px solid ${levelColor}50`, borderRadius: 12, padding: '3px 10px', marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: levelColor }} />
            <span style={{ fontSize: '0.65rem', color: levelColor, fontWeight: 700 }}>{aiCall.level}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#E5E7EB', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{aiCall.text}</div>
        </div>
      )}
    </div>
  )
}
