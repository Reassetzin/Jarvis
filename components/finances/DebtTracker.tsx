'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'

export interface Debt {
  id: string; name: string; type: string
  balance: number; original: number
  apr: number; minPayment: number
}

const DEBT_TYPES = ['Credit Card', 'Car Loan', 'Student Loan', 'Personal Loan', 'Mortgage', 'Other']
const TYPE_COLORS: Record<string, string> = {
  'Credit Card': '#EF4444', 'Car Loan': '#F59E0B', 'Student Loan': '#8B5CF6',
  'Personal Loan': '#EC4899', 'Mortgage': '#3B82F6', 'Other': '#6B7280',
}

export default function DebtTracker() {
  const [debts, setDebts] = usePersistentStore<Debt[]>('debts', [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Credit Card', balance: '', original: '', apr: '', minPayment: '' })
  const [paying, setPaying] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const totalDebt = debts.reduce((a, d) => a + d.balance, 0)
  const totalMin = debts.reduce((a, d) => a + d.minPayment, 0)

  function addDebt() {
    if (!form.name.trim() || !form.balance) return
    const bal = parseFloat(form.balance)
    setDebts(d => [...d, {
      id: Date.now().toString(), name: form.name.trim(), type: form.type,
      balance: bal, original: parseFloat(form.original) || bal,
      apr: parseFloat(form.apr) || 0, minPayment: parseFloat(form.minPayment) || 0,
    }])
    setForm({ name: '', type: 'Credit Card', balance: '', original: '', apr: '', minPayment: '' })
    setAdding(false)
  }

  function makePayment(id: string) {
    const amt = parseFloat(payAmount); if (isNaN(amt)) return
    setDebts(d => d.map(x => x.id === id ? { ...x, balance: Math.max(0, x.balance - amt) } : x))
    setPaying(null); setPayAmount('')
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Debt</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>${totalDebt.toLocaleString()}</div>
          {totalMin > 0 && <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>${totalMin}/mo minimums</div>}
        </div>
      </div>

      {debts.map(d => {
        const paidOff = d.original > 0 ? ((d.original - d.balance) / d.original) * 100 : 0
        return (
          <div key={d.id} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLORS[d.type] }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: '0.58rem', color: '#4B5563' }}>{d.type}</span>
              </div>
              <button onClick={() => setDebts(ds => ds.filter(x => x.id !== d.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
            </div>
            <div style={{ height: 5, background: '#0a0a0a', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${paidOff}%`, background: '#22C55E', borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                ${d.balance.toLocaleString()} left{d.apr > 0 && ` · ${d.apr}% APR`}
              </div>
              {paying === d.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="number" placeholder="$" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: 70, padding: '4px 8px' }} autoFocus onKeyDown={e => e.key === 'Enter' && makePayment(d.id)} />
                  <button onClick={() => makePayment(d.id)} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem' }}>Pay</button>
                </div>
              ) : (
                <button onClick={() => setPaying(d.id)} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '4px 10px' }}>Make Payment</button>
              )}
            </div>
          </div>
        )
      })}

      {debts.length === 0 && !adding && <div style={{ fontSize: '0.76rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No debts tracked. Add one to monitor payoff.</div>}

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, padding: 12, background: '#181818', borderRadius: 4 }}>
          <input type="text" placeholder="Name (e.g. Chase Sapphire)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{DEBT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" placeholder="Current balance" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} style={{ flex: 1 }} />
            <input type="number" placeholder="Original (opt)" value={form.original} onChange={e => setForm(f => ({ ...f, original: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" placeholder="APR %" value={form.apr} onChange={e => setForm(f => ({ ...f, apr: e.target.value }))} style={{ flex: 1 }} />
            <input type="number" placeholder="Min payment" value={form.minPayment} onChange={e => setForm(f => ({ ...f, minPayment: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={addDebt} className="btn-amber" style={{ flex: 1 }}>Add Debt</button>
            <button onClick={() => setAdding(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Plus size={13} /> Add Debt
        </button>
      )}
      <p style={{ fontSize: '0.58rem', color: '#374151', marginTop: 8, lineHeight: 1.4 }}>Debt is tracked separately and doesn't reduce your cash net worth. Payments here update the balance.</p>
    </div>
  )
}
