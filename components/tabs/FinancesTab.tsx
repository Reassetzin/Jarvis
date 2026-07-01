'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState, useMemo } from 'react'
import { X, Plus, TrendingUp, TrendingDown, Target } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import DebtTracker from '@/components/finances/DebtTracker'
import RecurringTransactions from '@/components/finances/RecurringTransactions'
import NetWorthChart from '@/components/finances/NetWorthChart'
import BillCalendar from '@/components/finances/BillCalendar'
import SpendingAlerts from '@/components/finances/SpendingAlerts'
import TransactionExplorer from '@/components/finances/TransactionExplorer'
import CashFlowChart from '@/components/finances/CashFlowChart'

interface Txn { id: string; type: 'income' | 'expense'; amount: number; category: string; label: string; date: string }
interface Budget { category: string; limit: number }
interface Goal { id: string; name: string; target: number; saved: number }
interface Subscription { id: string; name: string; amount: number; period: 'monthly' | 'yearly'; renewal: string }
interface Asset { id: string; label: string; amount: number }

const INCOME_CATS = ['Web Design', 'Real Estate', 'YouTube', 'Digital Products', 'Roblox', 'Other']
const EXPENSE_CATS = ['Food', 'Subscriptions', 'Shopping', 'Transport', 'Tools/Software', 'Entertainment', 'Health', 'Other']
const CAT_COLORS: Record<string, string> = {
  'Web Design': '#22C55E', 'Real Estate': '#3B82F6', 'YouTube': '#EF4444', 'Digital Products': '#8B5CF6', 'Roblox': '#EC4899',
  'Food': 'var(--accent)', 'Subscriptions': '#EF4444', 'Shopping': '#EC4899', 'Transport': '#3B82F6', 'Tools/Software': '#8B5CF6', 'Entertainment': '#EAB308', 'Health': '#22C55E', 'Other': '#6B7280',
}

function thisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export default function FinancesTab() {
  const [txns, setTxns] = usePersistentStore<Txn[]>('transactions', [])
  const [budgets, setBudgets] = usePersistentStore<Budget[]>('budgets', [])
  const [goals, setGoals] = usePersistentStore<Goal[]>('savings_goals', [])
  const [subs, setSubs] = usePersistentStore<Subscription[]>('subscriptions', [])
  const [assets, setAssets] = usePersistentStore<Asset[]>('assets', [])
  const [startBalance, setStartBalance] = usePersistentStore('starting_balance', 0)
  const [editingBalance, setEditingBalance] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')

  const [txnForm, setTxnForm] = useState({ type: 'expense' as 'income' | 'expense', amount: '', category: 'Food', label: '' })
  const [budgetForm, setBudgetForm] = useState({ category: 'Food', limit: '' })
  const [goalForm, setGoalForm] = useState({ name: '', target: '' })
  const [subForm, setSubForm] = useState({ name: '', amount: '', period: 'monthly' as 'monthly' | 'yearly', renewal: '' })
  const [assetForm, setAssetForm] = useState({ label: '', amount: '' })
  const [addingSub, setAddingSub] = useState(false)
  const [addingGoal, setAddingGoal] = useState(false)
  const [addingAsset, setAddingAsset] = useState(false)
  const [txnSearch, setTxnSearch] = useState('')
  const [txnFilter, setTxnFilter] = useState('all')
  const [showExplorer, setShowExplorer] = useState(false)

  const monthTxns = useMemo(() => txns.filter(t => thisMonth(t.date)), [txns])
  const income = monthTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const net = income - expenses

  const spendByCat = useMemo(() => {
    const map: Record<string, number> = {}
    monthTxns.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [monthTxns])

  const incomeByCat = useMemo(() => {
    const map: Record<string, number> = {}
    monthTxns.filter(t => t.type === 'income').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [monthTxns])

  // All-time cash flow → cash balance
  const allTimeIncome = useMemo(() => txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), [txns])
  const allTimeExpenses = useMemo(() => txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0), [txns])
  const cashBalance = startBalance + allTimeIncome - allTimeExpenses
  const netWorth = cashBalance + assets.reduce((a, x) => a + x.amount, 0)
  const monthlyBurn = subs.reduce((a, s) => a + (s.period === 'monthly' ? s.amount : s.amount / 12), 0)

  const filteredTxns = useMemo(() => {
    return monthTxns.filter(t => {
      if (txnFilter === 'income' && t.type !== 'income') return false
      if (txnFilter === 'expense' && t.type !== 'expense') return false
      if (txnFilter !== 'all' && txnFilter !== 'income' && txnFilter !== 'expense' && t.category !== txnFilter) return false
      if (txnSearch && !t.label.toLowerCase().includes(txnSearch.toLowerCase()) && !t.category.toLowerCase().includes(txnSearch.toLowerCase())) return false
      return true
    })
  }, [monthTxns, txnFilter, txnSearch])

  function addTxn() {
    if (!txnForm.amount || !txnForm.label.trim()) return
    setTxns(t => [{ id: Date.now().toString(), type: txnForm.type, amount: parseFloat(txnForm.amount), category: txnForm.category, label: txnForm.label.trim(), date: new Date().toISOString() }, ...t])
    setTxnForm({ ...txnForm, amount: '', label: '' })
  }

  const cats = txnForm.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  return (
    <PageShell>
      {/* Monthly summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><TrendingUp size={13} color="#22C55E" /><span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Income (mo)</span></div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22C55E' }}>${income.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><TrendingDown size={13} color="#EF4444" /><span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Expenses (mo)</span></div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EF4444' }}>${expenses.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 4 }}>Net (mo)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: net >= 0 ? '#22C55E' : '#EF4444' }}>{net >= 0 ? '+' : ''}${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Cash Balance</span>
          </div>
          {editingBalance ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <input type="number" step="0.01" value={balanceInput} onChange={e => setBalanceInput(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && (setStartBalance(parseFloat(balanceInput) || 0), setEditingBalance(false))} style={{ flex: 1, fontSize: '0.85rem', padding: '4px 8px' }} placeholder="Starting $" />
              <button onClick={() => { setStartBalance(parseFloat(balanceInput) || 0); setEditingBalance(false) }} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 4, padding: '0 10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>✓</button>
            </div>
          ) : (
            <div onDoubleClick={() => { setBalanceInput(startBalance.toString()); setEditingBalance(true) }} title="Double-click to adjust starting balance" style={{ fontSize: '1.3rem', fontWeight: 800, color: cashBalance >= 0 ? '#22C55E' : '#EF4444', cursor: 'default' }}>${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          )}
        </div>
      </div>

      <DesktopGrid columns={2}>
        <CashFlowChart txns={txns} />
        <SpendingAlerts />
        <NetWorthChart />
        <BillCalendar />
        <DebtTracker />
        <RecurringTransactions />
        {/* Add transaction */}
        <div className="card">
          <div className="section-header">Add Transaction</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button onClick={() => setTxnForm(f => ({ ...f, type: 'income', category: INCOME_CATS[0] }))} style={{ flex: 1, background: txnForm.type === 'income' ? '#0d1a0d' : 'transparent', border: `1px solid ${txnForm.type === 'income' ? '#166534' : '#333'}`, borderRadius: 4, padding: '8px', cursor: 'pointer', color: txnForm.type === 'income' ? '#22C55E' : '#6B7280', fontWeight: txnForm.type === 'income' ? 700 : 400, fontSize: '0.8rem' }}>+ Income</button>
            <button onClick={() => setTxnForm(f => ({ ...f, type: 'expense', category: EXPENSE_CATS[0] }))} style={{ flex: 1, background: txnForm.type === 'expense' ? '#1a0000' : 'transparent', border: `1px solid ${txnForm.type === 'expense' ? '#7f1d1d' : '#333'}`, borderRadius: 4, padding: '8px', cursor: 'pointer', color: txnForm.type === 'expense' ? '#EF4444' : '#6B7280', fontWeight: txnForm.type === 'expense' ? 700 : 400, fontSize: '0.8rem' }}>− Expense</button>
          </div>
          <input type="text" placeholder="Description" value={txnForm.label} onChange={e => setTxnForm(f => ({ ...f, label: e.target.value }))} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input type="number" placeholder="$ Amount" value={txnForm.amount} onChange={e => setTxnForm(f => ({ ...f, amount: e.target.value }))} style={{ flex: 1 }} />
            <select value={txnForm.category} onChange={e => setTxnForm(f => ({ ...f, category: e.target.value }))} style={{ flex: 1 }}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={addTxn} className="btn-amber">Add Transaction</button>

          {monthTxns.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.6rem', color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>This Month · {monthTxns.length} txns</span>
                <button onClick={() => setShowExplorer(true)} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '4px 10px' }}>View all →</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input type="text" placeholder="Search transactions..." value={txnSearch} onChange={e => setTxnSearch(e.target.value)} style={{ flex: 1, fontSize: '0.75rem', padding: '7px 10px' }} />
                <select value={txnFilter} onChange={e => setTxnFilter(e.target.value)} style={{ width: 'auto', fontSize: '0.72rem', padding: '7px 8px' }}>
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  {[...INCOME_CATS, ...EXPENSE_CATS].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {filteredTxns.length === 0 && <div style={{ fontSize: '0.72rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No matches.</div>}
                {filteredTxns.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #111' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[t.category] || '#6B7280', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.76rem', color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</div>
                      <div style={{ fontSize: '0.58rem', color: '#4B5563' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.type === 'income' ? '#22C55E' : '#EF4444', flexShrink: 0 }}>{t.type === 'income' ? '+' : '−'}${t.amount.toLocaleString()}</span>
                    <button onClick={() => setTxns(ts => ts.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', flexShrink: 0 }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spending by category + budgets */}
        <div className="card">
          <div className="section-header">Budgets & Spending</div>
          {EXPENSE_CATS.map(cat => {
            const spent = spendByCat[cat] || 0
            const budget = budgets.find(b => b.category === cat)
            if (spent === 0 && !budget) return null
            const limit = budget?.limit || 0
            const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
            const over = limit > 0 && spent > limit
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[cat] }} />
                    <span style={{ fontSize: '0.75rem', color: '#E5E7EB' }}>{cat}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: over ? '#EF4444' : '#9CA3AF', fontWeight: 600 }}>
                    ${spent.toLocaleString()}{limit > 0 && ` / ${limit.toLocaleString()}`}
                  </span>
                </div>
                {limit > 0 && (
                  <div style={{ height: 5, background: '#1f1f1f', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: over ? '#EF4444' : CAT_COLORS[cat], borderRadius: 3 }} />
                  </div>
                )}
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1a1a' }}>
            <select value={budgetForm.category} onChange={e => setBudgetForm(f => ({ ...f, category: e.target.value }))} style={{ flex: 1 }}>
              {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Limit" value={budgetForm.limit} onChange={e => setBudgetForm(f => ({ ...f, limit: e.target.value }))} style={{ width: 90 }} />
            <button className="glow-orange" onClick={() => { if (!budgetForm.limit) return; setBudgets(b => [...b.filter(x => x.category !== budgetForm.category), { category: budgetForm.category, limit: parseFloat(budgetForm.limit) }]); setBudgetForm({ category: 'Food', limit: '' }) }} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>Set</button>
          </div>
        </div>

        {/* Income breakdown */}
        <div className="card">
          <div className="section-header">Income Sources (mo)</div>
          {Object.keys(incomeByCat).length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No income logged this month.</div>
          ) : (
            Object.entries(incomeByCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
              const pct = income > 0 ? (amt / income) * 100 : 0
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[cat] }} />
                      <span style={{ fontSize: '0.75rem', color: '#E5E7EB' }}>{cat}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#22C55E', fontWeight: 600 }}>${amt.toLocaleString()} · {pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 5, background: '#1f1f1f', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: CAT_COLORS[cat], borderRadius: 3 }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Savings goals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Savings Goals</div>
            <Target size={14} color="var(--accent)" />
          </div>
          {goals.map(g => {
            const pct = Math.min(100, (g.saved / g.target) * 100)
            return (
              <div key={g.id} style={{ marginBottom: 12, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{g.name}</span>
                  <button onClick={() => setGoals(gs => gs.filter(x => x.id !== g.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                </div>
                <div style={{ height: 6, background: '#0a0a0a', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#22C55E' : 'var(--accent)', borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>${g.saved.toLocaleString()} / ${g.target.toLocaleString()}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, saved: x.saved + 50 } : x))} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>+$50</button>
                    <button onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, saved: x.saved + 100 } : x))} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>+$100</button>
                  </div>
                </div>
              </div>
            )
          })}
          {addingGoal ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="text" placeholder="Goal name" value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 2 }} />
              <input type="number" placeholder="Target $" value={goalForm.target} onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))} style={{ flex: 1 }} />
              <button className="glow-orange" onClick={() => { if (!goalForm.name || !goalForm.target) return; setGoals(g => [...g, { id: Date.now().toString(), name: goalForm.name, target: parseFloat(goalForm.target), saved: 0 }]); setGoalForm({ name: '', target: '' }); setAddingGoal(false) }} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          ) : (
            <button onClick={() => setAddingGoal(true)} className="btn-ghost" style={{ width: '100%' }}>+ Add Savings Goal</button>
          )}
        </div>

        {/* Subscriptions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Subscriptions</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EF4444' }}>${monthlyBurn.toFixed(0)}/mo</div>
              <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>${(monthlyBurn * 12).toFixed(0)}/yr</div>
            </div>
          </div>
          {subs.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #111' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem' }}>{s.name}</div>
                {s.renewal && <div style={{ fontSize: '0.6rem', color: '#4B5563' }}>Renews {s.renewal}</div>}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>${s.amount}/{s.period === 'monthly' ? 'mo' : 'yr'}</span>
              <button onClick={() => setSubs(ss => ss.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
            </div>
          ))}
          {addingSub ? (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" placeholder="Service" value={subForm.name} onChange={e => setSubForm(s => ({ ...s, name: e.target.value }))} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" placeholder="$" value={subForm.amount} onChange={e => setSubForm(s => ({ ...s, amount: e.target.value }))} style={{ flex: 1 }} />
                <select value={subForm.period} onChange={e => setSubForm(s => ({ ...s, period: e.target.value as any }))} style={{ flex: 1 }}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
              </div>
              <input type="text" placeholder="Renewal date" value={subForm.renewal} onChange={e => setSubForm(s => ({ ...s, renewal: e.target.value }))} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { if (!subForm.name || !subForm.amount) return; setSubs(ss => [...ss, { id: Date.now().toString(), name: subForm.name, amount: parseFloat(subForm.amount), period: subForm.period, renewal: subForm.renewal }]); setSubForm({ name: '', amount: '', period: 'monthly', renewal: '' }); setAddingSub(false) }} className="btn-amber" style={{ flex: 1 }}>Add</button>
                <button onClick={() => setAddingSub(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingSub(true)} className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>+ Add Subscription</button>
          )}
        </div>

        {/* Assets / Net worth */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Assets</div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>${netWorth.toLocaleString()}</span>
          </div>
          {assets.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #111' }}>
              <span style={{ flex: 1, fontSize: '0.78rem', color: '#9CA3AF' }}>{a.label}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>${a.amount.toLocaleString()}</span>
              <button onClick={() => setAssets(as => as.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
            </div>
          ))}
          {addingAsset ? (
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <input type="text" placeholder="e.g. Coinbase, Savings" value={assetForm.label} onChange={e => setAssetForm(a => ({ ...a, label: e.target.value }))} style={{ flex: 2 }} />
              <input type="number" placeholder="$" value={assetForm.amount} onChange={e => setAssetForm(a => ({ ...a, amount: e.target.value }))} style={{ flex: 1 }} />
              <button className="glow-orange" onClick={() => { if (!assetForm.label || !assetForm.amount) return; setAssets(as => [...as, { id: Date.now().toString(), label: assetForm.label, amount: parseFloat(assetForm.amount) }]); setAssetForm({ label: '', amount: '' }); setAddingAsset(false) }} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          ) : (
            <button onClick={() => setAddingAsset(true)} className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>+ Add Asset</button>
          )}
        </div>
      </DesktopGrid>

      {showExplorer && (
        <TransactionExplorer
          txns={txns}
          onDelete={id => setTxns(ts => ts.filter(x => x.id !== id))}
          onClose={() => setShowExplorer(false)}
        />
      )}
    </PageShell>
  )
}
