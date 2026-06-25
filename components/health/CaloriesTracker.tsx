'use client'
import { useDailyStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Sparkles, Loader } from 'lucide-react'

interface CalEntry { id: string; name: string; calories: number; protein?: number; carbs?: number; fat?: number }

export default function CaloriesTracker() {
  const [log, setLog] = useDailyStore<CalEntry[]>('calories_log', [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [manual, setManual] = useState(false)
  const [mName, setMName] = useState(''); const [mCal, setMCal] = useState('')

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

  const total = log.reduce((a, e) => a + e.calories, 0)
  const protein = log.reduce((a, e) => a + (e.protein || 0), 0)
  const carbs = log.reduce((a, e) => a + (e.carbs || 0), 0)
  const fat = log.reduce((a, e) => a + (e.fat || 0), 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Calories · AI Tracker</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>{total.toLocaleString()} kcal</div>
      </div>

      {(protein > 0 || carbs > 0 || fat > 0) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[{ l: 'Protein', v: protein, c: '#22C55E' }, { l: 'Carbs', v: carbs, c: '#F59E0B' }, { l: 'Fat', v: fat, c: '#EF4444' }].map(m => (
            <div key={m.l} style={{ flex: 1, background: '#181818', borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: m.c }}>{Math.round(m.v)}g</div>
              <div style={{ fontSize: '0.55rem', color: '#6B7280' }}>{m.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="text" placeholder='e.g. "1 lb grilled chicken + rice"' value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiEstimate()} style={{ flex: 1 }} />
        <button onClick={aiEstimate} disabled={loading} style={{ background: loading ? '#1f1f1f' : '#F59E0B', color: loading ? '#6B7280' : '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
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
        <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }}>
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
