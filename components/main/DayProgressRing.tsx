'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'

function getPhase(hour: number): { label: string; color: string } {
  if (hour < 10) return { label: 'Morning', color: '#F59E0B' }
  if (hour < 13) return { label: 'Midday', color: '#22C55E' }
  if (hour < 17) return { label: 'Afternoon', color: '#3B82F6' }
  return { label: 'Evening', color: '#8B5CF6' }
}

export default function DayProgressRing() {
  const [settings, setSettings] = usePersistentStore('day_settings', {
    wakeTime: '07:00', bedTime: '23:00'
  })
  const [now, setNow] = useState(new Date())
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const wakeMin = toMinutes(settings.wakeTime)
  const bedMin = toMinutes(settings.bedTime)
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const total = bedMin > wakeMin ? bedMin - wakeMin : (24 * 60 - wakeMin) + bedMin
  const elapsed = Math.max(0, Math.min(total, nowMin - wakeMin))
  const pct = total > 0 ? elapsed / total : 0

  const r = 70
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  const hoursLeft = Math.max(0, (total - elapsed) / 60)
  const phase = getPhase(now.getHours())

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="section-header" style={{ textAlign: 'left' }}>Day Progress</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke={phase.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
            filter="url(#ringGlow)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          <text x="80" y="74" textAnchor="middle" fill="#F3F4F6" fontSize="22" fontWeight="800">
            {Math.round(pct * 100)}%
          </text>
          <text x="80" y="92" textAnchor="middle" fill="#6B7280" fontSize="10">
            {hoursLeft.toFixed(1)}h left
          </text>
        </svg>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#1a1a1a', border: `1px solid ${phase.color}33`,
          borderRadius: 20, padding: '4px 14px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: phase.color }} />
          <span style={{ fontSize: '0.75rem', color: phase.color, fontWeight: 700 }}>{phase.label}</span>
        </div>
        {!editing ? (
          <button className="btn-ghost" style={{ fontSize: '0.7rem' }} onClick={() => setEditing(true)}>
            {settings.wakeTime} → {settings.bedTime} · Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Wake</div>
              <input type="time" value={settings.wakeTime}
                onChange={e => setSettings(s => ({ ...s, wakeTime: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Bed</div>
              <input type="time" value={settings.bedTime}
                onChange={e => setSettings(s => ({ ...s, bedTime: e.target.value }))} />
            </div>
            <button className="btn-ghost" onClick={() => setEditing(false)} style={{ alignSelf: 'flex-end' }}>✓</button>
          </div>
        )}
      </div>
    </div>
  )
}
