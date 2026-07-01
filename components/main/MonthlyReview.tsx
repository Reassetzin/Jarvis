'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Dumbbell, Calendar } from 'lucide-react'

interface Txn { type: 'income' | 'expense'; amount: number; category: string; date: string }
interface Session { date: string }

export default function MonthlyReview() {
  const [txns] = usePersistentStore<Txn[]>('transactions', [])
  const [activity] = usePersistentStore<Session[]>('activity_history', [])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = (d: Date) => d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()

    const sum = (pred: (d: Date) => boolean, type: 'income' | 'expense') =>
      txns.filter(t => t.type === type && pred(new Date(t.date))).reduce((a, t) => a + t.amount, 0)

    const inc = sum(thisMonth, 'income'), exp = sum(thisMonth, 'expense')
    const incL = sum(lastMonth, 'income'), expL = sum(lastMonth, 'expense')
    const workouts = activity.filter(s => { const d = new Date(s.date); return !isNaN(d.getTime()) && thisMonth(d) }).length
    const workoutsL = activity.filter(s => { const d = new Date(s.date); return !isNaN(d.getTime()) && lastMonth(d) }).length

    // Top spending category this month
    const catSpend: Record<string, number> = {}
    txns.filter(t => t.type === 'expense' && thisMonth(new Date(t.date))).forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount })
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]

    return { inc, exp, net: inc - exp, incL, expL, netL: incL - expL, workouts, workoutsL, topCat }
  }, [txns, activity])

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' })
  function delta(cur: number, prev: number) {
    if (prev === 0) return null
    const pct = ((cur - prev) / Math.abs(prev)) * 100
    return pct
  }

  function DeltaBadge({ cur, prev, invert }: { cur: number; prev: number; invert?: boolean }) {
    const d = delta(cur, prev)
    if (d === null) return null
    const good = invert ? d < 0 : d > 0
    return <span style={{ fontSize: '0.56rem', color: good ? '#22C55E' : '#EF4444', fontWeight: 600 }}>{d >= 0 ? '↑' : '↓'}{Math.abs(d).toFixed(0)}% vs last mo</span>
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>{monthName} Review</div>
        <Calendar size={13} color="#8B5CF6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <TrendingUp size={11} color="#22C55E" /><span style={{ fontSize: '0.58rem', color: '#6B7280' }}>Income</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22C55E' }}>${stats.inc.toLocaleString()}</div>
          <DeltaBadge cur={stats.inc} prev={stats.incL} />
        </div>
        <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <TrendingDown size={11} color="#EF4444" /><span style={{ fontSize: '0.58rem', color: '#6B7280' }}>Expenses</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444' }}>${stats.exp.toLocaleString()}</div>
          <DeltaBadge cur={stats.exp} prev={stats.expL} invert />
        </div>
        <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: '0.58rem', color: '#6B7280', marginBottom: 3 }}>Net</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: stats.net >= 0 ? '#22C55E' : '#EF4444' }}>{stats.net >= 0 ? '+' : ''}${stats.net.toLocaleString()}</div>
          <DeltaBadge cur={stats.net} prev={stats.netL} />
        </div>
        <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <Dumbbell size={11} color="#EC4899" /><span style={{ fontSize: '0.58rem', color: '#6B7280' }}>Workouts</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#EC4899' }}>{stats.workouts}</div>
          <DeltaBadge cur={stats.workouts} prev={stats.workoutsL} />
        </div>
      </div>

      {stats.topCat && (
        <div style={{ marginTop: 10, fontSize: '0.68rem', color: '#9CA3AF', textAlign: 'center' }}>
          Top spend: <span style={{ color: '#F59E0B', fontWeight: 600 }}>{stats.topCat[0]}</span> (${stats.topCat[1].toLocaleString()})
        </div>
      )}
    </div>
  )
}
