'use client'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts'
import { useDailyStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'

interface EnergyLog { hour: number; level: number; time: string }

export default function EnergyChart() {
  const [logs, setLogs] = useDailyStore<EnergyLog[]>('energy_curve', [])
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  function logEnergy(level: number) {
    const h = now.getHours() + now.getMinutes() / 60
    setLogs(l => [...l.filter(x => Math.abs(x.hour - h) > 0.5), { hour: h, level, time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }].sort((a, b) => a.hour - b.hour))
  }

  // Build chart data: 24 hours, interpolate between logged points
  const data = Array.from({ length: 25 }, (_, h) => {
    const label = h === 0 || h === 24 ? '12A' : h < 12 ? `${h}A` : h === 12 ? '12P' : `${h - 12}P`
    const exact = logs.find(l => Math.round(l.hour) === h)
    return { hour: h, time: label, level: exact ? exact.level : null }
  })

  // Fill nulls by interpolation for a smooth line
  const filled = [...data]
  for (let i = 0; i < filled.length; i++) {
    if (filled[i].level === null) {
      const prev = filled.slice(0, i).reverse().find(x => x.level !== null)
      const next = filled.slice(i + 1).find(x => x.level !== null)
      if (prev && next) {
        const ratio = (filled[i].hour - prev.hour) / (next.hour - prev.hour)
        filled[i].level = Math.round(prev.level! + (next.level! - prev.level!) * ratio)
      } else if (prev) filled[i].level = prev.level
      else if (next) filled[i].level = next.level
    }
  }

  const currentHour = now.getHours() + now.getMinutes() / 60
  const hasData = logs.length > 0
  const currentLevel = logs.length > 0 ? logs[logs.length - 1].level : 0
  const zone = currentLevel >= 7 ? { label: 'Peak', color: '#22C55E' } : currentLevel >= 4 ? { label: 'Steady', color: 'var(--accent)' } : currentLevel > 0 ? { label: 'Low', color: '#EF4444' } : { label: 'Not logged', color: '#6B7280' }

  return (
    <div className="card">
      <div className="section-header">Energy Through the Day</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: zone.color }}>{zone.label}</div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{hasData ? `Last logged: ${currentLevel}/10` : 'Tap below to log how you feel'}</div>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={filled} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4B5563' }} tickLine={false} axisLine={false} interval={3} />
            <YAxis hide domain={[0, 10]} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 4, fontSize: '0.75rem' }} labelStyle={{ color: '#9CA3AF' }} itemStyle={{ color: 'var(--accent)' }} />
            <ReferenceLine x={currentHour < 12 ? `${Math.round(currentHour)}A` : `${Math.round(currentHour) - 12 || 12}P`} stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1.5} />
            <Area type="monotone" dataKey="level" stroke="var(--accent)" strokeWidth={2} fill="url(#energyGrad)" connectNulls dot={{ r: 3, fill: 'var(--accent)' }} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.8rem', border: '1px dashed #1f1f1f', borderRadius: 4, marginBottom: 12 }}>
          No energy data yet today
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button onClick={() => logEnergy(8)} style={{ flex: 1, background: '#0d1a0d', border: '1px solid #166534', borderRadius: 4, padding: '10px', cursor: 'pointer', color: '#22C55E', fontSize: '0.78rem', fontWeight: 700 }}>High ⚡</button>
        <button onClick={() => logEnergy(5)} style={{ flex: 1, background: '#1a0e00', border: '1px solid var(--accent-dim)', borderRadius: 4, padding: '10px', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700 }}>Medium</button>
        <button onClick={() => logEnergy(2)} style={{ flex: 1, background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 4, padding: '10px', cursor: 'pointer', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700 }}>Low 🔋</button>
      </div>
    </div>
  )
}
