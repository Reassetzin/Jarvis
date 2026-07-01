'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Sparkles, Loader, TrendingUp, TrendingDown, Dumbbell, Droplet, Pill } from 'lucide-react'
import { getStreak } from '@/lib/streaks'

interface Txn { type: 'income' | 'expense'; amount: number; category: string; date: string }
interface Session { date: string; type?: string }

function inLast7Days(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
  return d >= weekAgo && d <= now
}

export default function WeeklyReview() {
  const [txns] = usePersistentStore<Txn[]>('transactions', [])
  const [activity] = usePersistentStore<Session[]>('activity_history', [])
  const [brands] = usePersistentStore<any[]>('brands', [])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const weekTxns = txns.filter(t => inLast7Days(t.date))
  const income = weekTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expenses = weekTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const workouts = activity.filter(s => { const d = new Date(s.date); return !isNaN(d.getTime()) && inLast7Days(s.date) }).length
  const waterStreak = getStreak('water')
  const vitaminStreak = getStreak('vitamins')
  const activityStreak = getStreak('activity')

  // Content shipped this week
  let shipped = 0
  brands.forEach(b => (b.ideas || []).forEach((idea: any) => { if (idea.status === 'Shipped' || idea.status === 'shipped') shipped++ }))

  // Top spending category this week
  const catSpend: Record<string, number> = {}
  weekTxns.filter(t => t.type === 'expense').forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount })
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]

  async function getInsights() {
    setLoading(true)
    const summary = `WEEKLY DATA (last 7 days):
- Income: $${income}
- Expenses: $${expenses}
- Net: $${income - expenses}
- Top spending category: ${topCat ? `${topCat[0]} ($${topCat[1]})` : 'none'}
- Workouts logged: ${workouts}
- Content shipped: ${shipped}
- Water streak: ${waterStreak} days
- Vitamin streak: ${vitaminStreak} days
- Activity streak: ${activityStreak} days
- Transaction count: ${weekTxns.length}`
    try {
      const res = await fetch('/api/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary }) })
      const data = await res.json()
      setInsights(data.insights || [])
      setExpanded(true)
    } catch { setInsights(['Could not generate insights. Check your API key.']) }
    finally { setLoading(false) }
  }

  const net = income - expenses
  const isSunday = new Date().getDay() === 0

  return (
    <div className="card" style={{ border: isSunday ? '1px solid rgba(245,158,11,0.3)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Weekly Review{isSunday ? ' · Sunday' : ''}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        <Stat icon={net >= 0 ? TrendingUp : TrendingDown} label="Net" value={`${net >= 0 ? '+' : ''}$${net.toLocaleString()}`} color={net >= 0 ? '#22C55E' : '#EF4444'} />
        <Stat icon={Dumbbell} label="Workouts" value={`${workouts}`} color="#EC4899" />
        <Stat icon={Droplet} label="Water streak" value={`${waterStreak}d`} color="#3B82F6" />
        <Stat icon={Pill} label="Vitamin streak" value={`${vitaminStreak}d`} color="#22C55E" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9CA3AF', padding: '0 4px', marginBottom: 12 }}>
        <span>In: <span style={{ color: '#22C55E' }}>${income.toLocaleString()}</span></span>
        <span>Out: <span style={{ color: '#EF4444' }}>${expenses.toLocaleString()}</span></span>
        {shipped > 0 && <span>Shipped: <span style={{ color: '#EAB308' }}>{shipped}</span></span>}
      </div>

      {insights.length > 0 && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {insights.map((ins, i) => (
            <div key={i} className="item-enter" style={{ display: 'flex', gap: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '8px 10px' }}>
              <Sparkles size={12} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.74rem', color: '#E5E7EB', lineHeight: 1.4 }}>{ins}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={getInsights} disabled={loading} className={loading ? '' : 'glow-orange'} style={{
        width: '100%', background: loading ? '#1f1f1f' : '#F59E0B', color: loading ? '#6B7280' : '#000',
        border: 'none', borderRadius: 8, padding: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.8rem',
      }}>
        {loading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</> : <><Sparkles size={14} /> {insights.length > 0 ? 'Refresh AI Insights' : 'Get AI Insights'}</>}
      </button>
    </div>
  )
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '9px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        <Icon size={11} color={color} />
        <span style={{ fontSize: '0.58rem', color: '#6B7280' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</div>
    </div>
  )
}
