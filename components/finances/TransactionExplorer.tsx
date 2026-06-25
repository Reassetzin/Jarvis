'use client'
import { useState, useMemo } from 'react'
import { X, ArrowLeft } from 'lucide-react'

interface Txn { id: string; type: 'income' | 'expense'; amount: number; category: string; label: string; date: string }

const CAT_COLORS: Record<string, string> = {
  'Web Design': '#22C55E', 'Real Estate': '#3B82F6', 'YouTube': '#EF4444', 'Digital Products': '#8B5CF6', 'Roblox': '#EC4899',
  'Food': '#F59E0B', 'Subscriptions': '#EF4444', 'Shopping': '#EC4899', 'Transport': '#3B82F6', 'Tools/Software': '#8B5CF6', 'Entertainment': '#EAB308', 'Health': '#22C55E', 'Other': '#6B7280',
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TransactionExplorer({ txns, onDelete, onClose }: { txns: Txn[]; onDelete: (id: string) => void; onClose: () => void }) {
  const [groupBy, setGroupBy] = useState<'month' | 'year' | 'category'>('month')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const filtered = useMemo(() => txns.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [txns, typeFilter, search])

  const groups = useMemo(() => {
    const map: Record<string, Txn[]> = {}
    filtered.forEach(t => {
      const d = new Date(t.date)
      let key = ''
      if (groupBy === 'month') key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      else if (groupBy === 'year') key = `${d.getFullYear()}`
      else key = t.category
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return Object.entries(map).sort((a, b) => {
      if (groupBy === 'category') return b[1].reduce((s, t) => s + t.amount, 0) - a[1].reduce((s, t) => s + t.amount, 0)
      return new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
    })
  }, [filtered, groupBy])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 640, height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>All Transactions · {filtered.length}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {(['month', 'year', 'category'] as const).map(g => (
            <button key={g} onClick={() => { setGroupBy(g); setOpenGroup(null) }} style={{
              background: groupBy === g ? '#1a0a00' : 'transparent', border: `1px solid ${groupBy === g ? '#92400E' : '#333'}`,
              borderRadius: 4, padding: '5px 12px', cursor: 'pointer', color: groupBy === g ? '#F59E0B' : '#9CA3AF',
              fontWeight: groupBy === g ? 700 : 400, fontSize: '0.72rem', textTransform: 'capitalize',
            }}>{g}</button>
          ))}
          <div style={{ flex: 1 }} />
          {(['all', 'income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              background: typeFilter === t ? '#181818' : 'transparent', border: `1px solid ${typeFilter === t ? '#444' : '#222'}`,
              borderRadius: 4, padding: '5px 10px', cursor: 'pointer',
              color: typeFilter === t ? (t === 'income' ? '#22C55E' : t === 'expense' ? '#EF4444' : '#E5E7EB') : '#6B7280',
              fontSize: '0.7rem', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
        <input type="text" placeholder="Search all transactions..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12, fontSize: '0.78rem' }} />

        {/* Grouped list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {groups.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '32px 0' }}>No transactions match.</div>}
          {groups.map(([key, items]) => {
            const inc = items.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
            const exp = items.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
            const isOpen = openGroup === key
            return (
              <div key={key} style={{ marginBottom: 8 }}>
                <button onClick={() => setOpenGroup(isOpen ? null : key)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: '#181818',
                  border: '1px solid #222', borderRadius: 4, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                }}>
                  {groupBy === 'category' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[key] || '#6B7280' }} />}
                  <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: '#E5E7EB' }}>{key}</span>
                  <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>{items.length}</span>
                  {inc > 0 && <span style={{ fontSize: '0.72rem', color: '#22C55E', fontWeight: 600 }}>+${inc.toLocaleString()}</span>}
                  {exp > 0 && <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>−${exp.toLocaleString()}</span>}
                </button>
                {isOpen && (
                  <div style={{ padding: '4px 0 4px 12px' }}>
                    {items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #111' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[t.category] || '#6B7280', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.76rem', color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</div>
                          <div style={{ fontSize: '0.58rem', color: '#4B5563' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.type === 'income' ? '#22C55E' : '#EF4444' }}>{t.type === 'income' ? '+' : '−'}${t.amount.toLocaleString()}</span>
                        <button onClick={() => onDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
