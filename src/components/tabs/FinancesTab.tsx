'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface NetWorthEntry {
  id: string
  label: string
  amount: number
  category: 'asset' | 'liability'
}

interface Subscription {
  id: string
  name: string
  amount: number
  renewal_date: string
  category: string
}

interface Order {
  id: string
  name: string
  amount: number
  status: string
  order_date: string
}

interface HaulItem {
  id: string
  name: string
  amount: number
  date: string
}

interface WishlistItem {
  id: string
  name: string
  amount: number
  column_type: 'buy' | 'future'
}

export default function FinancesTab() {
  const today = getLocalDate()

  const [netWorth, setNetWorth] = useState<NetWorthEntry[]>([])
  const [nwLabel, setNwLabel] = useState('')
  const [nwAmount, setNwAmount] = useState('')
  const [nwCategory, setNwCategory] = useState<'asset' | 'liability'>('asset')

  const [subs, setSubs] = useState<Subscription[]>([])
  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('')
  const [subDate, setSubDate] = useState('')
  const [subCategory, setSubCategory] = useState('')

  const [orders, setOrders] = useState<Order[]>([])
  const [orderName, setOrderName] = useState('')
  const [orderAmount, setOrderAmount] = useState('')
  const [orderStatus, setOrderStatus] = useState('Pending')

  const [haul, setHaul] = useState<HaulItem[]>([])
  const [haulName, setHaulName] = useState('')
  const [haulAmount, setHaulAmount] = useState('')

  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishName, setWishName] = useState('')
  const [wishAmount, setWishAmount] = useState('')
  const [wishType, setWishType] = useState<'buy' | 'future'>('buy')

  useEffect(() => {
    const nw = localStorage.getItem('jarvis_finances_networth')
    if (nw) setNetWorth(JSON.parse(nw) as NetWorthEntry[])
    const s = localStorage.getItem('jarvis_subscriptions')
    if (s) setSubs(JSON.parse(s) as Subscription[])
    const o = localStorage.getItem('jarvis_orders')
    if (o) setOrders(JSON.parse(o) as Order[])
    const h = localStorage.getItem('jarvis_haul')
    if (h) setHaul(JSON.parse(h) as HaulItem[])
    const w = localStorage.getItem('jarvis_wishlist')
    if (w) setWishlist(JSON.parse(w) as WishlistItem[])
  }, [])

  const assets = netWorth.filter(e => e.category === 'asset').reduce((s, e) => s + e.amount, 0)
  const liabilities = netWorth.filter(e => e.category === 'liability').reduce((s, e) => s + e.amount, 0)
  const totalNetWorth = assets - liabilities

  const addNetWorth = () => {
    if (!nwLabel || !nwAmount) return
    const updated = [...netWorth, { id: newId(), label: nwLabel, amount: Number(nwAmount), category: nwCategory }]
    setNetWorth(updated)
    localStorage.setItem('jarvis_finances_networth', JSON.stringify(updated))
    setNwLabel(''); setNwAmount('')
  }

  const monthlyTotal = subs.reduce((s, sub) => s + sub.amount, 0)

  const addSub = () => {
    if (!subName) return
    const updated = [...subs, { id: newId(), name: subName, amount: Number(subAmount), renewal_date: subDate, category: subCategory }]
    setSubs(updated)
    localStorage.setItem('jarvis_subscriptions', JSON.stringify(updated))
    setSubName(''); setSubAmount(''); setSubDate(''); setSubCategory('')
  }

  const addOrder = () => {
    if (!orderName) return
    const updated = [...orders, { id: newId(), name: orderName, amount: Number(orderAmount), status: orderStatus, order_date: today }]
    setOrders(updated)
    localStorage.setItem('jarvis_orders', JSON.stringify(updated))
    setOrderName(''); setOrderAmount('')
  }

  const addHaul = () => {
    if (!haulName) return
    const updated = [...haul, { id: newId(), name: haulName, amount: Number(haulAmount), date: today }]
    setHaul(updated)
    localStorage.setItem('jarvis_haul', JSON.stringify(updated))
    setHaulName(''); setHaulAmount('')
  }

  const addWish = () => {
    if (!wishName) return
    const updated = [...wishlist, { id: newId(), name: wishName, amount: Number(wishAmount), column_type: wishType }]
    setWishlist(updated)
    localStorage.setItem('jarvis_wishlist', JSON.stringify(updated))
    setWishName(''); setWishAmount('')
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="section-header">NET WORTH</div>
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div>
            <p className="text-xs text-gray-500">Assets</p>
            <p className="text-green-400 font-semibold">€{assets.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Liabilities</p>
            <p className="text-red-400 font-semibold">€{liabilities.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net Worth</p>
            <p className={`font-bold ${totalNetWorth >= 0 ? 'text-brand' : 'text-red-400'}`}>€{totalNetWorth.toLocaleString()}</p>
          </div>
        </div>
        {netWorth.map(e => (
          <div key={e.id} className="flex justify-between text-xs py-1 border-b border-[#222]">
            <span className="text-gray-300">{e.label}</span>
            <span className={e.category === 'asset' ? 'text-green-400' : 'text-red-400'}>€{e.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex gap-1 mt-2">
          <input className={inp} placeholder="Label" value={nwLabel} onChange={e => setNwLabel(e.target.value)} />
          <input className={`${inp} w-24`} type="number" placeholder="Amount" value={nwAmount} onChange={e => setNwAmount(e.target.value)} />
          <select className={inp} value={nwCategory} onChange={e => setNwCategory(e.target.value as 'asset' | 'liability')}>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
          </select>
          <button onClick={addNetWorth} className="px-2 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">SUBSCRIPTIONS — €{monthlyTotal.toFixed(2)}/mo</div>
        {subs.map(s => (
          <div key={s.id} className="flex justify-between text-xs py-1 border-b border-[#222]">
            <span className="text-gray-300">{s.name} <span className="text-gray-600">{s.category}</span></span>
            <span className="text-brand">€{s.amount}/mo</span>
          </div>
        ))}
        <div className="flex flex-wrap gap-1 mt-2">
          <input className={inp} placeholder="Name" value={subName} onChange={e => setSubName(e.target.value)} />
          <input className={`${inp} w-20`} type="number" placeholder="€/mo" value={subAmount} onChange={e => setSubAmount(e.target.value)} />
          <input className={inp} placeholder="Category" value={subCategory} onChange={e => setSubCategory(e.target.value)} />
          <button onClick={addSub} className="px-2 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">ORDERS</div>
        {orders.map(o => (
          <div key={o.id} className="flex justify-between text-xs py-1 border-b border-[#222]">
            <span className="text-gray-300">{o.name}</span>
            <span className="text-gray-500">{o.status}</span>
            <span className="text-brand">€{o.amount}</span>
          </div>
        ))}
        <div className="flex gap-1 mt-2">
          <input className={inp} placeholder="Name" value={orderName} onChange={e => setOrderName(e.target.value)} />
          <input className={`${inp} w-20`} type="number" placeholder="€" value={orderAmount} onChange={e => setOrderAmount(e.target.value)} />
          <select className={inp} value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
            <option>Pending</option><option>Shipped</option><option>Delivered</option>
          </select>
          <button onClick={addOrder} className="px-2 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">RECENT HAUL</div>
        {haul.map(h => (
          <div key={h.id} className="flex justify-between text-xs py-1 border-b border-[#222]">
            <span className="text-gray-300">{h.name}</span>
            <span className="text-brand">€{h.amount}</span>
          </div>
        ))}
        <div className="flex gap-1 mt-2">
          <input className={inp} placeholder="Item" value={haulName} onChange={e => setHaulName(e.target.value)} />
          <input className={`${inp} w-20`} type="number" placeholder="€" value={haulAmount} onChange={e => setHaulAmount(e.target.value)} />
          <button onClick={addHaul} className="px-2 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">WISHLIST</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Buy Soon</p>
            {wishlist.filter(w => w.column_type === 'buy').map(w => (
              <div key={w.id} className="text-xs py-1 border-b border-[#222]">
                <span className="text-gray-300">{w.name}</span>
                <span className="text-brand ml-2">€{w.amount}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Future</p>
            {wishlist.filter(w => w.column_type === 'future').map(w => (
              <div key={w.id} className="text-xs py-1 border-b border-[#222]">
                <span className="text-gray-300">{w.name}</span>
                <span className="text-brand ml-2">€{w.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <input className={inp} placeholder="Item" value={wishName} onChange={e => setWishName(e.target.value)} />
          <input className={`${inp} w-20`} type="number" placeholder="€" value={wishAmount} onChange={e => setWishAmount(e.target.value)} />
          <select className={inp} value={wishType} onChange={e => setWishType(e.target.value as 'buy' | 'future')}>
            <option value="buy">Buy</option>
            <option value="future">Future</option>
          </select>
          <button onClick={addWish} className="px-2 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>
    </div>
  )
}
