'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingDown, TrendingUp, Target } from 'lucide-react'

interface Entry { date: string; weight: number; bodyFat?: number }

export default function WeightTracker() {
  const [entries, setEntries] = usePersistentStore<Entry[]>('weight_log', [])
  const [goal, setGoal] = usePersistentStore('weight_goal', 0)
  const [unit, setUnit] = usePersistentStore<'lbs' | 'kg'>('weight_unit', 'lbs')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  function toggleUnit() {
    const factor = unit === 'lbs' ? 0.453592 : 2.20462
    setEntries(es => es.map(e => ({ ...e, weight: Math.round(e.weight * factor * 10) / 10 })))
    if (goal > 0) setGoal(Math.round(goal * factor * 10) / 10)
    setUnit(u => u === 'lbs' ? 'kg' : 'lbs')
  }

  function logWeight() {
    const w = parseFloat(weight); if (isNaN(w)) return
    const today = new Date().toISOString().split('T')[0]
    const entry: Entry = { date: today, weight: w }
    if (bodyFat) entry.bodyFat = parseFloat(bodyFat)
    setEntries(e => [...e.filter(x => x.date !== today), entry].sort((a, b) => a.date.localeCompare(b.date)))
    setWeight(''); setBodyFat('')
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const delta = latest && prev ? latest.weight - prev.weight : 0
  const first = sorted[0]
  const totalChange = latest && first ? latest.weight - first.weight : 0

  const chartData = sorted.map(e => ({ date: e.date.slice(5), weight: e.weight, bodyFat: e.bodyFat }))
  const weights = sorted.map(e => e.weight)
  const minW = weights.length ? Math.min(...weights, goal || Infinity) - 2 : 0
  const maxW = weights.length ? Math.max(...weights, goal || 0) + 2 : 100

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Weight</div>
        <button onClick={toggleUnit} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{unit}</button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>{latest ? latest.weight : '--'}<span style={{ fontSize: '0.8rem', color: '#6B7280' }}> {unit}</span></div>
        {delta !== 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: delta < 0 ? '#22C55E' : '#EF4444', fontSize: '0.78rem', fontWeight: 600 }}>
            {delta < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {Math.abs(delta).toFixed(1)}
          </div>
        )}
      </div>
      {(latest?.bodyFat || totalChange !== 0) && (
        <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 10 }}>
          {latest?.bodyFat && `${latest.bodyFat}% body fat · `}
          {totalChange !== 0 && `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} ${unit} all-time`}
        </div>
      )}

      {chartData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4B5563' }} tickLine={false} axisLine={false} />
            <YAxis domain={[minW, maxW]} tick={{ fontSize: 9, fill: '#4B5563' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 4, fontSize: '0.75rem' }} labelStyle={{ color: '#9CA3AF' }} />
            {goal > 0 && <ReferenceLine y={goal} stroke="#22C55E" strokeDasharray="4 4" label={{ value: `Goal ${goal}`, fontSize: 9, fill: '#22C55E', position: 'insideTopRight' }} />}
            <Line type="monotone" dataKey="weight" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2, fill: '#F59E0B' }} isAnimationActive animationDuration={800} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.78rem', border: '1px dashed #1f1f1f', borderRadius: 4, marginBottom: 10 }}>
          Log at least 2 weigh-ins to see your trend
        </div>
      )}

      {goal > 0 && latest && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#181818', borderRadius: 4, padding: '8px 12px', margin: '10px 0' }}>
          <Target size={13} color="#22C55E" />
          <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
            {Math.abs(latest.weight - goal).toFixed(1)} {unit} to goal ({goal})
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input type="number" step="0.1" placeholder={`Weight (${unit})`} value={weight} onChange={e => setWeight(e.target.value)} style={{ flex: 2 }} />
        <input type="number" step="0.1" placeholder="BF% (opt)" value={bodyFat} onChange={e => setBodyFat(e.target.value)} style={{ flex: 1 }} />
        <button className="glow-orange" onClick={logWeight} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>Log</button>
      </div>

      {editingGoal ? (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input type="number" step="0.1" placeholder={`Goal weight (${unit})`} value={goalInput} onChange={e => setGoalInput(e.target.value)} style={{ flex: 1 }} />
          <button onClick={() => { setGoal(parseFloat(goalInput) || 0); setEditingGoal(false) }} className="btn-amber" style={{ width: 'auto', padding: '8px 16px' }}>Set</button>
        </div>
      ) : (
        <button onClick={() => { setGoalInput(goal ? goal.toString() : ''); setEditingGoal(true) }} className="btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: '0.72rem' }}>
          {goal > 0 ? `Goal: ${goal} ${unit} · edit` : '+ Set goal weight'}
        </button>
      )}
    </div>
  )
}
