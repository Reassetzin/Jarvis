'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'

interface Asset { id: string; label: string; amount: number }
interface Subscription { id: string; name: string; amount: number; currency: string; period: 'monthly' | 'yearly'; renewal: string }
interface HaulItem { id: string; name: string; cost: number }
const CURRENCIES = ['USD', 'CHF', 'EUR', 'GBP', 'CAD']

export default function FinancesTab() {
  const [crypto, setCrypto] = usePersistentStore<Asset[]>('crypto_assets', [])
  const [otherAssets, setOtherAssets] = usePersistentStore<Asset[]>('other_assets', [])
  const [subs, setSubs] = usePersistentStore<Subscription[]>('subscriptions', [])
  const [orders, setOrders] = usePersistentStore<string[]>('incoming_orders', [])
  const [haulItems, setHaulItems] = usePersistentStore<HaulItem[]>('haul_items', [])
  const [haulBudget, setHaulBudget] = usePersistentStore('haul_budget', 200)
  const [wantsBuy, setWantsBuy] = usePersistentStore<string[]>('wants_buy', [])
  const [wantsFuture, setWantsFuture] = usePersistentStore<string[]>('wants_future', [])

  const [assetInput, setAssetInput] = useState({ label: '', amount: '' })
  const [subInput, setSubInput] = useState({ name: '', amount: '', currency: 'USD', period: 'monthly' as 'monthly' | 'yearly', renewal: '' })
  const [orderInput, setOrderInput] = useState('')
  const [haulInput, setHaulInput] = useState({ name: '', cost: '' })
  const [wantInput, setWantInput] = useState('')
  const [wantCol, setWantCol] = useState<'buy' | 'future'>('buy')
  const [addingAsset, setAddingAsset] = useState<'crypto' | 'other' | null>(null)
  const [addingSub, setAddingSub] = useState(false)
  const [addingHaul, setAddingHaul] = useState(false)

  const totalCrypto = crypto.reduce((a, x) => a + x.amount, 0)
  const totalOther = otherAssets.reduce((a, x) => a + x.amount, 0)
  const netWorth = totalCrypto + totalOther
  const monthlyBurn = subs.reduce((a, s) => s.currency !== 'USD' ? a : a + (s.period === 'monthly' ? s.amount : s.amount / 12), 0)
  const haulTotal = haulItems.reduce((a, x) => a + x.cost, 0)

  const NetWorthCard = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Net Worth</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22C55E' }}>${netWorth.toLocaleString()}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px' }}>
          <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 2 }}>Crypto</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F59E0B' }}>${totalCrypto.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px' }}>
          <div style={{ fontSize: '0.6rem', color: '#6B7280', marginBottom: 2 }}>Other</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9CA3AF' }}>${totalOther.toLocaleString()}</div>
        </div>
      </div>
      {[...crypto.map(a => ({ ...a, type: 'Crypto' })), ...otherAssets.map(a => ({ ...a, type: 'Other' }))].map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #111' }}>
          <span style={{ flex: 1, fontSize: '0.78rem', color: '#9CA3AF' }}>{a.label}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>${a.amount.toLocaleString()}</span>
          <button onClick={() => { if (a.type === 'Crypto') setCrypto(c => c.filter(x => x.id !== a.id)); else setOtherAssets(o => o.filter(x => x.id !== a.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button onClick={() => setAddingAsset('crypto')} className="btn-ghost" style={{ flex: 1, fontSize: '0.72rem' }}>+ Crypto</button>
        <button onClick={() => setAddingAsset('other')} className="btn-ghost" style={{ flex: 1, fontSize: '0.72rem' }}>+ Other</button>
      </div>
      {addingAsset && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input type="text" placeholder={addingAsset === 'crypto' ? 'e.g. Coinbase BTC' : 'Asset label'} value={assetInput.label} onChange={e => setAssetInput(a => ({ ...a, label: e.target.value }))} />
          <input type="number" placeholder="USD amount" value={assetInput.amount} onChange={e => setAssetInput(a => ({ ...a, amount: e.target.value }))} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { if (!assetInput.label || !assetInput.amount) return; const entry = { id: Date.now().toString(), label: assetInput.label, amount: parseFloat(assetInput.amount) }; if (addingAsset === 'crypto') setCrypto(c => [...c, entry]); else setOtherAssets(o => [...o, entry]); setAssetInput({ label: '', amount: '' }); setAddingAsset(null) }} className="btn-amber" style={{ flex: 1 }}>Add</button>
            <button onClick={() => setAddingAsset(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  const SubsCard = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Subscriptions</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#EF4444' }}>${monthlyBurn.toFixed(0)}/mo</div>
          <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>${(monthlyBurn * 12).toFixed(0)}/yr</div>
        </div>
      </div>
      {subs.map(s => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #111' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem' }}>{s.name}</div>
            {s.renewal && <div style={{ fontSize: '0.62rem', color: '#4B5563' }}>Renews {s.renewal}</div>}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>{s.currency} {s.amount}/{s.period === 'monthly' ? 'mo' : 'yr'}</span>
          <button onClick={() => setSubs(ss => ss.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
        </div>
      ))}
      {!addingSub ? (
        <button onClick={() => setAddingSub(true)} className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>+ Add Subscription</button>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input type="text" placeholder="Service name" value={subInput.name} onChange={e => setSubInput(s => ({ ...s, name: e.target.value }))} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" placeholder="Amount" value={subInput.amount} onChange={e => setSubInput(s => ({ ...s, amount: e.target.value }))} style={{ flex: 2 }} />
            <select value={subInput.currency} onChange={e => setSubInput(s => ({ ...s, currency: e.target.value }))} style={{ flex: 1 }}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <select value={subInput.period} onChange={e => setSubInput(s => ({ ...s, period: e.target.value as any }))}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
          <input type="text" placeholder="Renewal date" value={subInput.renewal} onChange={e => setSubInput(s => ({ ...s, renewal: e.target.value }))} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { if (!subInput.name || !subInput.amount) return; setSubs(ss => [...ss, { id: Date.now().toString(), ...subInput, amount: parseFloat(subInput.amount) }]); setSubInput({ name: '', amount: '', currency: 'USD', period: 'monthly', renewal: '' }); setAddingSub(false) }} className="btn-amber" style={{ flex: 1 }}>Add</button>
            <button onClick={() => setAddingSub(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  const OrdersCard = (
    <div className="card">
      <div className="section-header">Incoming Orders</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {orders.map((o, i) => (
          <div key={i} className="tag">{o}
            <button onClick={() => setOrders(os => os.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 0 }}><X size={11} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="text" placeholder="Item name..." value={orderInput} onChange={e => setOrderInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && orderInput.trim()) { setOrders(o => [...o, orderInput.trim()]); setOrderInput('') } }} style={{ flex: 1 }} />
        <button onClick={() => { if (orderInput.trim()) { setOrders(o => [...o, orderInput.trim()]); setOrderInput('') } }} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
      </div>
    </div>
  )

  const HaulCard = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Weekly Haul</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: haulTotal > haulBudget ? '#EF4444' : '#22C55E' }}>CHF {haulTotal.toFixed(2)} / {haulBudget}</div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Budget (CHF)</div>
        <input type="number" value={haulBudget} onChange={e => setHaulBudget(Number(e.target.value))} />
      </div>
      {haulItems.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #111' }}>
          <span style={{ flex: 1, fontSize: '0.78rem' }}>{item.name}</span>
          <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>CHF {item.cost.toFixed(2)}</span>
          <button onClick={() => setHaulItems(h => h.filter(x => x.id !== item.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
        </div>
      ))}
      {!addingHaul ? (
        <button onClick={() => setAddingHaul(true)} className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>+ Add Item</button>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input type="text" placeholder="Item" value={haulInput.name} onChange={e => setHaulInput(h => ({ ...h, name: e.target.value }))} style={{ flex: 2 }} />
          <input type="number" placeholder="CHF" value={haulInput.cost} onChange={e => setHaulInput(h => ({ ...h, cost: e.target.value }))} style={{ flex: 1 }} />
          <button onClick={() => { if (!haulInput.name || !haulInput.cost) return; setHaulItems(h => [...h, { id: Date.now().toString(), name: haulInput.name, cost: parseFloat(haulInput.cost) }]); setHaulInput({ name: '', cost: '' }); setAddingHaul(false) }} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 10px', cursor: 'pointer', fontWeight: 700 }}>+</button>
        </div>
      )}
    </div>
  )

  const WishlistCard = (
    <div className="card">
      <div className="section-header">Wants / Wishlist</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['buy', 'future'] as const).map(col => (
          <button key={col} onClick={() => setWantCol(col)} style={{ flex: 1, background: wantCol === col ? (col === 'buy' ? '#1a0a00' : '#0a0a1a') : 'transparent', border: `1px solid ${wantCol === col ? (col === 'buy' ? '#92400E' : '#1e3a5f') : '#333'}`, borderRadius: 4, padding: '8px', cursor: 'pointer', fontSize: '0.75rem', color: wantCol === col ? (col === 'buy' ? '#F59E0B' : '#3B82F6') : '#6B7280', fontWeight: wantCol === col ? 700 : 400 }}>
            {col === 'buy' ? 'Still to Buy' : 'Future'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {(wantCol === 'buy' ? wantsBuy : wantsFuture).map((w, i) => (
          <div key={i} className="tag" style={{ borderColor: wantCol === 'buy' ? '#92400E' : '#1e3a5f', color: wantCol === 'buy' ? '#F59E0B' : '#60A5FA' }}>
            {w}<button onClick={() => { if (wantCol === 'buy') setWantsBuy(ws => ws.filter((_, j) => j !== i)); else setWantsFuture(ws => ws.filter((_, j) => j !== i)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 0 }}><X size={11} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="text" placeholder={wantCol === 'buy' ? 'Add to buy list...' : 'Add to future...'} value={wantInput} onChange={e => setWantInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && wantInput.trim()) { if (wantCol === 'buy') setWantsBuy(w => [...w, wantInput.trim()]); else setWantsFuture(w => [...w, wantInput.trim()]); setWantInput('') } }} style={{ flex: 1 }} />
        <button onClick={() => { if (!wantInput.trim()) return; if (wantCol === 'buy') setWantsBuy(w => [...w, wantInput.trim()]); else setWantsFuture(w => [...w, wantInput.trim()]); setWantInput('') }} style={{ background: wantCol === 'buy' ? '#F59E0B' : '#3B82F6', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 32 }}>
      <DesktopGrid columns={3}>
        {NetWorthCard}
        {SubsCard}
        {OrdersCard}
        {HaulCard}
        {WishlistCard}
      </DesktopGrid>
    </div>
  )
}
