'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'

interface Event { id: string; title: string; date: string; time: string; type: string }

const EVENT_META: Record<string, { color: string; emoji: string }> = {
  Appointment: { color: '#EF4444', emoji: '🩺' },
  Meeting: { color: '#3B82F6', emoji: '👥' },
  Birthday: { color: '#EC4899', emoji: '🎂' },
  Reminder: { color: '#F59E0B', emoji: '⏰' },
  Social: { color: '#8B5CF6', emoji: '🎉' },
  Travel: { color: '#22C55E', emoji: '✈️' },
  Other: { color: '#6B7280', emoji: '📌' },
}

function parseYmd(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

export default function UpcomingEvents() {
  const [events] = usePersistentStore<Event[]>('planner_events', [])

  const upcoming = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const horizon = new Date(now); horizon.setDate(horizon.getDate() + 30)
    return events
      .filter(e => { const d = parseYmd(e.date); return d >= now && d <= horizon })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99'))
      .slice(0, 5)
  }, [events])

  function label(dateStr: string) {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const d = parseYmd(dateStr)
    const days = Math.round((d.getTime() - now.getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'long' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Upcoming</div>
        <CalendarClock size={14} style={{ color: 'var(--accent)' }} />
      </div>
      {upcoming.length === 0 ? (
        <div style={{ fontSize: '0.74rem', color: '#374151', textAlign: 'center', padding: '14px 0' }}>No events in the next 30 days. Add some in the Planner.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {upcoming.map(e => {
            const meta = EVENT_META[e.type] || EVENT_META.Other
            const soon = label(e.date) === 'Today' || label(e.date) === 'Tomorrow'
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#181818', border: `1px solid ${soon ? meta.color + '55' : '#222'}`, borderRadius: 8, padding: '9px 11px' }}>
                <span style={{ fontSize: '1rem' }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#F3F4F6', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                  <div style={{ fontSize: '0.6rem', color: meta.color }}>{e.type}{e.time && ` · ${e.time}`}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: soon ? meta.color : '#9CA3AF' }}>{label(e.date)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
