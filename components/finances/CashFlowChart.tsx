'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { useMemo } from 'react'

interface Txn { id: string; type: 'income' | 'expense'; amount: number; category: string; label: string; date: string }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CAT_COLORS: Record<string, string> = {
  'Food': '#F59E0B', 'Subscriptions': '#EF4444', 'Shopping': '#EC4899', 'Transport': '#3B82F6', 'Tools/Software': '#8B5CF6', 'Entertainment': '#EAB308', 'Health': '#22C55E', 'Other': '#6B7280',
}

export default function CashFlowChart({ txns }: { txns: Txn[] }) {
  // Last 6 months income vs expense
  const monthly = useMemo(() => {
    const now = new Date()
    const arr: { month: string; income: number; expense: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthTxns = txns.filter(t => { const td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() })
      arr.push({
        month: MONTHS[d.getMonth()],
        income: monthTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0),
        expense: monthTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
      })
    }
    return arr
  }, [txns])

  // This month expense breakdown for pie
  const pieData = useMemo(() => {
    const now = new Date()
    const map: Record<string, number> = {}
    txns.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [txns])

  const hasData = monthly.some(m => m.income > 0 || m.expense > 0)

  return (
    <div className="card">
      <div className="section-header">Cash Flow · 6 Months</div>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#4B5563' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 4, fontSize: '0.75rem' }} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="income" fill="#22C55E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {pieData.length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: 16 }}>Spending Mix · This Month</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ResponsiveContainer width="50%" height={130}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={2}>
                      {pieData.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.name] || '#6B7280'} stroke="#000" strokeWidth={1} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 4, fontSize: '0.75rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {pieData.sort((a, b) => b.value - a.value).slice(0, 6).map(e => (
                    <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[e.name] || '#6B7280' }} />
                      <span style={{ fontSize: '0.68rem', color: '#9CA3AF', flex: 1 }}>{e.name}</span>
                      <span style={{ fontSize: '0.68rem', color: '#E5E7EB', fontWeight: 600 }}>${e.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '0.8rem', border: '1px dashed #1f1f1f', borderRadius: 4 }}>
          Add transactions to see your cash flow trends
        </div>
      )}
    </div>
  )
}
