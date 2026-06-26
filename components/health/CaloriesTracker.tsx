'use client'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Sparkles, Loader, Settings } from 'lucide-react'

interface CalEntry { id: string; name: string; calories: number; protein?: number; carbs?: number; fat?: number }
interface Targets { calories: number; protein: number; carbs: number; fat: number; mode: 'cut' | 'maintain' | 'bulk' }

function Ring({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = value > max && max > 0
  const r = 26, circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const ringColor = over ? '#EF4444' : color
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1f1f1f" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 4px ${ringColor}90)` }} />
        <text x="32" y="30" textAnchor="middle" fill={ringColor} fontSize="12" fontWeight="800">{Math.round(value)}</text>
        <text x="32" y="42" textAnchor="middle" fill="#6B7280" fontSize="7">/{max}{unit}</text>
      </svg>
      <span style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600 }}>{label}</span>
    </div>
  )
}

export default function CaloriesTracker() {
  const [log, setLog] = useDailyStore<CalEntry[]>('calories_log', [])
  const [targets, setTargets] = usePersistentStore<Targets>('calorie_targets', { calories: 0, protein: 0, carbs: 0, fat: 0, mode: 'maintain' })
  const [weightLog] = usePersistentStore<{ date: string; weight: number }[]>('weight_log', [])
  const [unit] = usePersistentStore<'lbs' | 'kg'>('weight_unit', 'lbs')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [manual, setManual] = useState(false)
  const [mName, setMName] = useState(''); const [mCal, setMCal] = useState('')
  const [editingTargets, setEditingTargets] = useState(false)
  const [tForm, setTForm] = useState(targets)

  async function aiEstimate() {
    if (!input.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/calories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: input }) })
      const d = await res.json()
      if (d.calories) {
        setLog(l => [...l, { id: Date.now().toString(), name: d.food || input, calories: Math.round(d.calories), protein: d.protein, carbs: d.carbs, fat: d.fat }])
        setInput('')
      } else { alert('Could not estimate. Try manual entry or check API key.') }
    } catch { alert('AI estimate failed. Check your API key.') }
    finally { setLoading(false) }
  }

  function addManual() {
    if (!mName.trim() || !mCal) return
    setLog(l => [...l, { id: Date.now().toString(), name: mName, calories: parseInt(mCal) }])
    setMName(''); setMCal('')
  }

  // Auto-calculate targets from latest weight + mode
  function autoCalc() {
    const latest = [...weightLog].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0]
    if (!latest) { alert('Log your weight first to auto-calculate targets.'); return }
    const lbs = unit === 'kg' ? latest.weight * 2.20462 : latest.weight
    // Rough TDEE: bodyweight(lbs) * 14-16. Protein 1g/lb.
    const base = lbs * 15
    const cals = tForm.mode === 'cut' ? Math.round(base - 500) : tForm.mode === 'bulk' ? Math.round(base + 300) : Math.round(base)
    const protein = Math.round(lbs)
    const fat = Math.round((cals * 0.25) / 9)
    const carbs = Math.round((cals - protein * 4 - fat * 9) / 4)
    setTForm({ calories: cals, protein, carbs, fat, mode: tForm.mode })
  }

  const total = log.reduce((a, e) => a + e.calories, 0)
  const protein = log.reduce((a, e) => a + (e.protein || 0), 0)
  const carbs = log.reduce((a, e) => a + (e.carbs || 0), 0)
  const fat = log.reduce((a, e) => a + (e.fat || 0), 0)
  const hasTargets = targets.calories > 0

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Calories · AI Tracker</div>
        <button onClick={() => { setTForm(targets); setEditingTargets(e => !e) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: editingTargets ? '#F59E0B' : '#6B7280', display: 'flex' }}><Settings size={15} /></button>
      </div>

      {editingTargets ? (
        <div style={{ background: '#181818', borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>Daily Targets</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['cut', 'maintain', 'bulk'] as const).map(m => (
              <button key={m} onClick={() => setTForm(f => ({ ...f, mode: m }))} style={{ flex: 1, background: tForm.mode === m ? '#1a0a00' : 'transparent', border: `1px solid ${tForm.mode === m ? '#F59E0B' : '#333'}`, borderRadius: 4, padding: '6px', cursor: 'pointer', color: tForm.mode === m ? '#F59E0B' : '#6B7280', fontSize: '0.7rem', fontWeight: tForm.mode === m ? 700 : 400, textTransform: 'capitalize' }}>{m}</button>
            ))}
          </div>
          <button onClick={autoCalc} className="btn-ghost" style={{ fontSize: '0.7rem' }}>⚡ Auto-calc from weight</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {([['calories', 'Calories'], ['protein', 'Protein g'], ['carbs', 'Carbs g'], ['fat', 'Fat g']] as const).map(([k, lbl]) => (
              <div key={k}>
                <div style={{ fontSize: '0.58rem', color: '#6B7280', marginBottom: 3 }}>{lbl}</div>
                <input type="number" value={(tForm as any)[k] || ''} onChange={e => setTForm(f => ({ ...f, [k]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setTargets(tForm); setEditingTargets(false) }} className="btn-amber" style={{ flex: 1 }}>Save</button>
            <button onClick={() => setEditingTargets(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : hasTargets ? (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14, padding: '4px 0' }}>
          <Ring value={total} max={targets.calories} color="#F59E0B" label="Calories" unit="" />
          <Ring value={protein} max={targets.protein} color="#22C55E" label="Protein" unit="g" />
          <Ring value={carbs} max={targets.carbs} color="#EAB308" label="Carbs" unit="g" />
          <Ring value={fat} max={targets.fat} color="#EF4444" label="Fat" unit="g" />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, background: '#181818', borderRadius: 8, padding: '10px 12px' }}>
          <div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>{total.toLocaleString()} kcal</div><div style={{ fontSize: '0.6rem', color: '#6B7280' }}>P{Math.round(protein)} · C{Math.round(carbs)} · F{Math.round(fat)}</div></div>
          <button onClick={() => { setTForm(targets); setEditingTargets(true) }} className="btn-ghost" style={{ fontSize: '0.7rem' }}>Set targets</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="text" placeholder='e.g. "1 lb grilled chicken + rice"' value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiEstimate()} style={{ flex: 1 }} />
        <button onClick={aiEstimate} disabled={loading} className={loading ? '' : 'glow-orange'} style={{ background: loading ? '#1f1f1f' : '#F59E0B', color: loading ? '#6B7280' : '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
        </button>
      </div>
      <button onClick={() => setManual(m => !m)} style={{ background: 'none', border: 'none', color: '#4B5563', fontSize: '0.65rem', cursor: 'pointer', marginBottom: 8 }}>
        {manual ? '− Hide manual entry' : '+ Manual entry'}
      </button>

      {manual && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input type="text" placeholder="Meal" value={mName} onChange={e => setMName(e.target.value)} style={{ flex: 2 }} />
          <input type="number" placeholder="kcal" value={mCal} onChange={e => setMCal(e.target.value)} style={{ flex: 1 }} />
          <button onClick={addManual} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
        </div>
      )}

      {log.map(e => (
        <div key={e.id} className="item-enter" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: '#E5E7EB' }}>{e.name}</div>
            {e.protein != null && <div style={{ fontSize: '0.58rem', color: '#4B5563' }}>P{Math.round(e.protein)} · C{Math.round(e.carbs || 0)} · F{Math.round(e.fat || 0)}</div>}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>{e.calories}</span>
          <button onClick={() => setLog(l => l.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
        </div>
      ))}
    </div>
  )
}
