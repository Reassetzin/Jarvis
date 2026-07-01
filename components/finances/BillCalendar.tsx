'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

interface Subscription { id: string; name: string; amount: number; period: 'monthly' | 'yearly'; renewal: string }
interface Recurring { id: string; type: 'income' | 'expense'; amount: number; label: string; frequency: 'weekly' | 'monthly'; dayOfMonth: number }

interface Bill { name: string; amount: number; date: Date; type: 'sub' | 'recurring'; income?: boolean }

export default function BillCalendar() {
  const [subs] = usePersistentStore<Subscription[]>('subscriptions', [])
  const [recurring] = usePersistentStore<Recurring[]>('recurring_txns', [])

  const bills = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const horizon = new Date(now); horizon.setDate(horizon.getDate() + 45) // next 45 days
    const out: Bill[] = []

    // Subscriptions: next renewal based on renewal day/date
    subs.forEach(s => {
      if (s.renewal) {
        // renewal stored as a date string; compute next occurrence
        const base = new Date(s.renewal)
        if (!isNaN(base.getTime())) {
          let next = new Date(base)
          // advance to future
          while (next < now) {
            if (s.period === 'yearly') next.setFullYear(next.getFullYear() + 1)
            else next.setMonth(next.getMonth() + 1)
          }
          if (next <= horizon) out.push({ name: s.name, amount: s.amount, date: next, type: 'sub' })
        }
      }
    })

    // Recurring monthly: next dayOfMonth
    recurring.forEach(r => {
      if (r.frequency === 'monthly') {
        let next = new Date(now.getFullYear(), now.getMonth(), Math.min(r.dayOfMonth, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()))
        if (next < now) next = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(r.dayOfMonth, new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()))
        if (next <= horizon) out.push({ name: r.label, amount: r.amount, date: next, type: 'recurring', income: r.type === 'income' })
      } else {
        // weekly: next 7-day mark(s) within horizon
        let next = new Date(now); next.setDate(next.getDate() + 7)
        if (next <= horizon) out.push({ name: r.label, amount: r.amount, date: next, type: 'recurring', income: r.type === 'income' })
      }
    })

    return out.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [subs, recurring])

  const totalDue = bills.filter(b => !b.income).reduce((a, b) => a + b.amount, 0)

  function daysUntil(d: Date) {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - now.getTime()) / 86400000)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Upcoming Bills · 45d</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} color="#EF4444" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EF4444' }}>${totalDue.toLocaleString()}</span>
        </div>
      </div>

      {bills.length === 0 ? (
        <div style={{ fontSize: '0.74rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>No upcoming bills. Add subscriptions with renewal dates or recurring transactions.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bills.map((b, i) => {
            const days = daysUntil(b.date)
            const soon = days <= 3
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#181818', border: `1px solid ${soon && !b.income ? '#7f1d1d' : '#222'}`, borderRadius: 6, padding: '8px 11px' }}>
                <div style={{ textAlign: 'center', minWidth: 34 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: soon && !b.income ? '#EF4444' : '#E5E7EB', lineHeight: 1 }}>{b.date.getDate()}</div>
                  <div style={{ fontSize: '0.52rem', color: '#6B7280', textTransform: 'uppercase' }}>{b.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ fontSize: '0.58rem', color: soon ? '#EF4444' : '#6B7280' }}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}{b.type === 'sub' ? ' · renewal' : ''}</div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: b.income ? '#22C55E' : '#EF4444' }}>{b.income ? '+' : '−'}${b.amount.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
