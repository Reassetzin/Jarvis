'use client'
import { usePersistentStore } from '@/hooks/useStore'

const DAY_WORKOUTS = ['REST', 'PUSH', 'PULL', 'LEGS', 'REST', 'PUSH', 'PULL']

function getDayLabel() {
  const day = new Date().getDay()
  return DAY_WORKOUTS[day] + ' DAY'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
}

export default function TopBar() {
  const [whoop] = usePersistentStore('whoop', {
    recovery: 0, sleep: 0, strain: 0, hrv: 0, rhr: 0,
  })

  const recColor = whoop.recovery >= 67 ? '#22C55E' : whoop.recovery >= 34 ? '#F59E0B' : '#EF4444'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.97)',
      borderBottom: '1px solid #1f1f1f',
      backdropFilter: 'blur(12px)',
      padding: '10px 16px 8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', letterSpacing: '0.08em', fontWeight: 600 }}>
            {formatDate()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.06em' }}>
            {getDayLabel()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <StatBadge label="REC" value={`${whoop.recovery}%`} color={recColor} />
          <StatBadge label="SLP" value={`${whoop.sleep}%`} color="#9CA3AF" />
          <StatBadge label="STR" value={whoop.strain.toFixed(1)} color="#9CA3AF" />
          <StatBadge label="RHR" value={whoop.rhr ? `${whoop.rhr}` : '--'} color="#9CA3AF" />
        </div>
      </div>
    </header>
  )
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#111', border: '1px solid #222', borderRadius: 4,
      padding: '3px 7px', minWidth: 36,
    }}>
      <span style={{ fontSize: '0.5rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
