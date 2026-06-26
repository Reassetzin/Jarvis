'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'
import { X, Plus, Repeat } from 'lucide-react'

interface Txn { id: string; type: 'income' | 'expense'; amount: number; category: string; label: string; date: string }
export interface Recurring {
  id: string; type: 'income' | 'expense'; amount: number; category: string; label: string
  frequency: 'weekly' | 'monthly'; dayOfMonth: number; lastPosted: string | null
}

const INCOME_CATS = ['Web Design', 'Real Estate', 'YouTube', 'Digital Products', 'Roblox', 'Other']
const EXPENSE_CATS = ['Food', 'Subscriptions', 'Shopping', 'Transport', 'Tools/Software', 'Entertainment', 'Health', 'Other']

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

// Returns list of dates (ISO) a recurring rule should have posted on, between lastPosted and today
function getDuePostings(r: Recurring): string[] {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const postings: string[] = []
  const start = r.lastPosted ? new Date(r.lastPosted) : new Date(today.getFullYear(), today.getMonth() - 1, 1)
  start.setHours(0, 0, 0, 0)

  if (r.frequency === 'monthly') {
    // Walk months from start to today, posting on dayOfMonth
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cursor <= today) {
      const postDate = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(r.dayOfMonth, new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()))
      postDate.setHours(0, 0, 0, 0)
      if (postDate > start && postDate <= today) postings.push(postDate.toISOString())
      cursor.setMonth(cursor.getMonth() + 1)
    }
  } else {
    // weekly: every 7 days from start
    let cursor = new Date(start)
    cursor.setDate(cursor.getDate() + 7)
    while (cursor <= today) {
      postings.push(new Date(cursor).toISOString())
      cursor.setDate(cursor.getDate() + 7)
    }
  }
  return postings
}

export default function RecurringTransactions() {
  const [recurring, setRecurring] = usePersistentStore<Recurring[]>('recurring_txns', [])
  const [txns, setTxns] = usePersistentStore<Txn[]>('transactions', [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: 'expense' as 'income' | 'expense', amount: '', category: 'Subscriptions', label: '', frequency: 'monthly' as 'weekly' | 'monthly', dayOfMonth: '1' })

  // Auto-post due recurring transactions on mount
  useEffect(() => {
    if (recurring.length === 0) return
    let newTxns: Txn[] = []
    const updated = recurring.map(r => {
      const due = getDuePostings(r)
      due.forEach(dateIso => {
        newTxns.push({ id: `rec_${r.id}_${dateIso}`, type: r.type, amount: r.amount, category: r.category, label: `${r.label} (auto)`, date: dateIso })
      })
      return due.length > 0 ? { ...r, lastPosted: new Date().toISOString() } : r
    })
    if (newTxns.length > 0) {
      setTxns(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const toAdd = newTxns.filter(t => !existingIds.has(t.id))
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev
      })
      setRecurring(updated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addRecurring() {
    if (!form.label.trim() || !form.amount) return
    setRecurring(r => [...r, {
      id: Date.now().toString(), type: form.type, amount: parseFloat(form.amount),
      category: form.category, label: form.label.trim(), frequency: form.frequency,
      dayOfMonth: parseInt(form.dayOfMonth) || 1, lastPosted: new Date().toISOString(),
    }])
    setForm({ type: 'expense', amount: '', category: 'Subscriptions', label: '', frequency: 'monthly', dayOfMonth: '1' })
    setAdding(false)
  }

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const monthlyImpact = recurring.reduce((a, r) => {
    const mult = r.frequency === 'monthly' ? 1 : 4.33
    return a + (r.type === 'income' ? r.amount : -r.amount) * mult
  }, 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Recurring</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Repeat size={12} color="#8B5CF6" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: monthlyImpact >= 0 ? '#22C55E' : '#EF4444' }}>
            {monthlyImpact >= 0 ? '+' : ''}${Math.round(monthlyImpact).toLocaleString()}/mo
          </span>
        </div>
      </div>

      {recurring.map(r => (
        <div key={r.id} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '9px 12px', marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.type === 'income' ? '#22C55E' : '#EF4444', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', color: '#E5E7EB' }}>{r.label}</div>
            <div style={{ fontSize: '0.58rem', color: '#4B5563' }}>
              {r.category} · {r.frequency === 'monthly' ? `monthly (day ${r.dayOfMonth})` : 'weekly'}
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: r.type === 'income' ? '#22C55E' : '#EF4444' }}>{r.type === 'income' ? '+' : '−'}${r.amount.toLocaleString()}</span>
          <button onClick={() => setRecurring(rs => rs.filter(x => x.id !== r.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
        </div>
      ))}

      {recurring.length === 0 && !adding && <div style={{ fontSize: '0.74rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No recurring transactions. Add rent, paychecks, subscriptions.</div>}

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, padding: 12, background: '#181818', borderRadius: 4 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setForm(f => ({ ...f, type: 'income', category: INCOME_CATS[0] }))} style={{ flex: 1, background: form.type === 'income' ? '#0d1a0d' : 'transparent', border: `1px solid ${form.type === 'income' ? '#166534' : '#333'}`, borderRadius: 4, padding: '7px', cursor: 'pointer', color: form.type === 'income' ? '#22C55E' : '#6B7280', fontSize: '0.78rem', fontWeight: form.type === 'income' ? 700 : 400 }}>+ Income</button>
            <button onClick={() => setForm(f => ({ ...f, type: 'expense', category: EXPENSE_CATS[0] }))} style={{ flex: 1, background: form.type === 'expense' ? '#1a0000' : 'transparent', border: `1px solid ${form.type === 'expense' ? '#7f1d1d' : '#333'}`, borderRadius: 4, padding: '7px', cursor: 'pointer', color: form.type === 'expense' ? '#EF4444' : '#6B7280', fontSize: '0.78rem', fontWeight: form.type === 'expense' ? 700 : 400 }}>− Expense</button>
          </div>
          <input type="text" placeholder="Label (e.g. Rent, Paycheck)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" placeholder="$ Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ flex: 1 }} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ flex: 1 }}>{cats.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as any }))} style={{ flex: 1 }}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            {form.frequency === 'monthly' && (
              <input type="number" min="1" max="31" placeholder="Day" value={form.dayOfMonth} onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))} style={{ width: 70 }} title="Day of month" />
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={addRecurring} className="btn-amber" style={{ flex: 1 }}>Add Recurring</button>
            <button onClick={() => setAdding(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Plus size={13} /> Add Recurring
        </button>
      )}
      <p style={{ fontSize: '0.58rem', color: '#374151', marginTop: 8, lineHeight: 1.4 }}>Recurring items auto-post to your transactions when due (checked each time you open the app).</p>
    </div>
  )
}
