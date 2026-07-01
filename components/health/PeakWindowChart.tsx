'use client'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts'
import { usePersistentStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'

function generateEnergyData(recovery: number, sleepDebt: number) {
  const points: { time: string; energy: number; hour: number }[] = []
  for (let h = 0; h <= 24; h++) {
    let e = 0
    const rFactor = recovery / 100
    const debtPenalty = Math.min(0.4, sleepDebt * 0.08)

    if (h < 6) e = 10 + h * 2
    else if (h < 8) e = 20 + (h - 6) * 20 * rFactor
    else if (h < 10) e = 60 + (h - 8) * 15 * rFactor
    else if (h < 12) e = 85 + (h - 10) * 5 * rFactor
    else if (h < 13) e = 90 - (h - 12) * 10
    else if (h < 14) e = 65
    else if (h < 16) e = 65 + (h - 14) * 10 * rFactor
    else if (h < 18) e = 80 - (h - 16) * 15
    else if (h < 20) e = 55 - (h - 18) * 10
    else if (h < 22) e = 35 - (h - 20) * 5
    else e = 25 - (h - 22) * 5

    e = Math.max(5, Math.min(100, e - debtPenalty * 100))

    const label = h === 0 || h === 24 ? '12A' : h < 12 ? `${h}A` : h === 12 ? '12P' : `${h - 12}P`
    points.push({ time: label, energy: Math.round(e), hour: h })
  }
  return points
}

function getZone(energy: number): { label: string; color: string } {
  if (energy >= 70) return { label: 'Peak', color: 'var(--accent)' }
  if (energy >= 45) return { label: 'Steady', color: '#EAB308' }
  return { label: 'Foggy', color: '#6B7280' }
}

export default function PeakWindowChart() {
  const [whoop] = usePersistentStore('whoop', { recovery: 75, sleep: 80, strain: 0, hrv: 0, rhr: 0 })
  const [sleepDebt, setSleepDebt] = useState(1)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const data = generateEnergyData(whoop.recovery, sleepDebt)
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentEnergy = data.find(d => Math.abs(d.hour - Math.round(currentHour)) < 0.5)?.energy || 50
  const zone = getZone(currentEnergy)

  const CustomDot = () => null

  return (
    <div className="card">
      <div className="section-header">Peak Window · Cognitive Energy</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: zone.color }}>{zone.label}</div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Current zone · {Math.round(currentEnergy)}% energy</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Sleep debt (hrs)</div>
          <input type="number" value={sleepDebt} min={0} max={10} step={0.5}
            onChange={e => setSleepDebt(Number(e.target.value))}
            style={{ width: 60, textAlign: 'center' }} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4B5563' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 4, fontSize: '0.75rem' }}
            labelStyle={{ color: '#9CA3AF' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <ReferenceLine x={currentHour < 12 ? `${Math.round(currentHour)}A` : `${Math.round(currentHour) - 12}P`}
            stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1.5} />
          <Area
            type="monotone" dataKey="energy"
            stroke="var(--accent)" strokeWidth={2}
            fill="url(#energyGrad)"
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {[{ label: 'Peak', color: 'var(--accent)', range: '70–100%' }, { label: 'Steady', color: '#EAB308', range: '45–70%' }, { label: 'Foggy', color: '#6B7280', range: '0–45%' }].map(z => (
          <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
            <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
