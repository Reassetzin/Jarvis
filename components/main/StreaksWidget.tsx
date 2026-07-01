'use client'
import { useEffect, useState } from 'react'
import { getStreak, getBestStreak, isCompleteToday, StreakCategory } from '@/lib/streaks'
import { onDataChange } from '@/lib/sync'
import { Droplet, Pill, Dumbbell, Flame } from 'lucide-react'

const CATS: { id: StreakCategory; label: string; Icon: any; color: string }[] = [
  { id: 'water', label: 'Water', Icon: Droplet, color: '#3B82F6' },
  { id: 'vitamins', label: 'Vitamins', Icon: Pill, color: '#22C55E' },
  { id: 'activity', label: 'Activity', Icon: Dumbbell, color: '#EC4899' },
]

export default function StreaksWidget() {
  const [, force] = useState(0)
  useEffect(() => {
    const refresh = () => force(n => n + 1)
    refresh()
    const t = setInterval(refresh, 30000)
    const un = onDataChange(refresh)
    return () => { clearInterval(t); un() }
  }, [])

  return (
    <div className="card">
      <div className="section-header">Streaks</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CATS.map(({ id, label, Icon, color }) => {
          const streak = getStreak(id)
          const best = getBestStreak(id)
          const doneToday = isCompleteToday(id)
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '9px 12px' }}>
              <Icon size={16} color={color} />
              <span style={{ flex: 1, fontSize: '0.82rem', color: '#E5E7EB' }}>{label}</span>
              {best > 0 && <span style={{ fontSize: '0.58rem', color: '#4B5563' }}>best {best}</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Flame size={15} color={streak > 0 ? (doneToday ? 'var(--accent)' : 'var(--accent-dim)') : '#374151'} fill={streak > 0 && doneToday ? 'var(--accent)' : 'none'} />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: streak > 0 ? 'var(--accent)' : '#374151' }}>{streak}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '0.58rem', color: '#374151', marginTop: 8, lineHeight: 1.4 }}>Hit your water goal, take all vitamins, or log activity to keep each streak alive.</p>
    </div>
  )
}
