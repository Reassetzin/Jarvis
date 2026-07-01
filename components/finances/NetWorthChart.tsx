'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'

interface Txn { type: 'income' | 'expense'; amount: number; date: string }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function NetWorthChart() {
  const [txns] = usePersistentStore<Txn[]>('transactions', [])
  const [startBalance] = usePersistentStore('starting_balance', 0)
  const [assets] = usePersistentStore<{ amount: number }[]>('assets', [])

  const data = useMemo(() => {
    const assetTotal = assets.reduce((a, x) => a + x.amount, 0)
    const now = new Date()
    const points: { month: string; balance: number }[] = []
    // Build 6 months of end-of-month balances
    for (let i = 5; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      // Sum all transactions up to end of this month
      const net = txns.reduce((a, t) => {
        const td = new Date(t.date)
        if (td <= monthEnd) return a + (t.type === 'income' ? t.amount : -t.amount)
        return a
      }, 0)
      points.push({ month: MONTHS[monthEnd.getMonth()], balance: Math.round((startBalance + net + assetTotal) * 100) / 100 })
    }
    return points
  }, [txns, startBalance, assets])

  const hasData = data.some((d, i) => i > 0 && d.balance !== data[0].balance) || txns.length > 0
  const current = data[data.length - 1]?.balance || startBalance
  const first = data[0]?.balance || startBalance
  const change = current - first
  const pctChange = first !== 0 ? (change / Math.abs(first)) * 100 : 0

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Net Worth · 6mo</div>
        {hasData && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F59E0B' }}>${current.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div style={{ fontSize: '0.6rem', color: change >= 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>{change >= 0 ? '↑' : '↓'} ${Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(0)}%)</div>
          </div>
        )}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#4B5563' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid #333', borderRadius: 6, fontSize: '0.75rem' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Balance']} />
            <Area type="monotone" dataKey="balance" stroke="#F59E0B" strokeWidth={2} fill="url(#nwGrad)" dot={{ r: 2, fill: '#F59E0B' }} isAnimationActive animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.75rem' }}>Log transactions to see your trajectory</div>
      )}
    </div>
  )
}
