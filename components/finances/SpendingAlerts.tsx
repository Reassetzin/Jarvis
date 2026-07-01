'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Txn { type: 'income' | 'expense'; amount: number; category: string; date: string }
interface Budget { category: string; limit: number }

export default function SpendingAlerts() {
  const [txns] = usePersistentStore<Txn[]>('transactions', [])
  const [budgets] = usePersistentStore<Budget[]>('budgets', [])

  const alerts = useMemo(() => {
    if (budgets.length === 0) return []
    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthProgress = dayOfMonth / daysInMonth  // 0..1

    const thisMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()

    return budgets.map(b => {
      const spent = txns
        .filter(t => t.type === 'expense' && t.category === b.category && thisMonth(new Date(t.date)))
        .reduce((a, t) => a + t.amount, 0)
      const pctUsed = b.limit > 0 ? spent / b.limit : 0
      // Projected end-of-month spend based on current pace
      const projected = monthProgress > 0 ? spent / monthProgress : spent
      const projectedPct = b.limit > 0 ? projected / b.limit : 0

      let status: 'over' | 'pace' | 'ok' = 'ok'
      if (pctUsed >= 1) status = 'over'                              // already over
      else if (projectedPct > 1.1 && pctUsed > 0.2) status = 'pace' // trending over
      return { category: b.category, spent, limit: b.limit, pctUsed, projected, status }
    }).filter(a => a.status !== 'ok').sort((a, b) => b.pctUsed - a.pctUsed)
  }, [txns, budgets])

  if (budgets.length === 0) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Spending Alerts</div>
        {alerts.length === 0 ? <CheckCircle2 size={14} color="#22C55E" /> : <AlertTriangle size={14} color="#F59E0B" />}
      </div>

      {alerts.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#22C55E', padding: '4px 0' }}>
          <CheckCircle2 size={15} /> All budget categories on track this month.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(a => {
            const over = a.status === 'over'
            const color = over ? '#EF4444' : '#F59E0B'
            return (
              <div key={a.category} style={{ background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.82rem', color: '#F3F4F6', fontWeight: 600 }}>{a.category}</span>
                  <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>${a.spent.toFixed(0)} / ${a.limit.toFixed(0)}</span>
                </div>
                <div style={{ height: 5, background: '#0c0c0c', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, a.pctUsed * 100)}%`, background: color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.62rem', color }}>
                  {over
                    ? `Over budget by $${(a.spent - a.limit).toFixed(0)}`
                    : `On pace for ~$${a.projected.toFixed(0)} by month-end (${((a.projected / a.limit) * 100).toFixed(0)}% of budget)`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
