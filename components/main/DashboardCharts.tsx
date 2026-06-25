'use client'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function CashTrendChart() {
  const [txns] = usePersistentStore<{ type: string; amount: number; date: string }[]>('transactions', [])

  const data = useMemo(() => {
    const now = new Date()
    const arr: { month: string; net: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mt = txns.filter(t => { const td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() })
      const inc = mt.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
      const exp = mt.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      arr.push({ month: MONTHS[d.getMonth()], net: inc - exp })
    }
    return arr
  }, [txns])

  const hasData = data.some(d => d.net !== 0)

  return (
    <div className="card">
      <div className="section-header">Net Cash Flow · 6mo</div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#4B5563' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid #333', borderRadius: 6, fontSize: '0.75rem' }} />
            <Area type="monotone" dataKey="net" stroke="#22C55E" strokeWidth={2} fill="url(#netGrad)" dot={{ r: 2, fill: '#22C55E' }} isAnimationActive animationDuration={800} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.75rem' }}>Log income & expenses to see trend</div>
      )}
    </div>
  )
}

export function WeightTrendChart() {
  const [log] = usePersistentStore<{ date: string; weight: number }[]>('weight_log', [])
  const [unit] = usePersistentStore<'lbs' | 'kg'>('weight_unit', 'lbs')
  const data = [...log].sort((a, b) => a.date.localeCompare(b.date)).slice(-14).map(e => ({ date: e.date.slice(5), weight: e.weight }))

  return (
    <div className="card">
      <div className="section-header">Weight Trend</div>
      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 8, fill: '#4B5563' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid #333', borderRadius: 6, fontSize: '0.75rem' }} formatter={(v: any) => [`${v} ${unit}`, 'Weight']} />
            <Line type="monotone" dataKey="weight" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2, fill: '#F59E0B' }} isAnimationActive animationDuration={800} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.75rem' }}>Log 2+ weigh-ins to see trend</div>
      )}
    </div>
  )
}
