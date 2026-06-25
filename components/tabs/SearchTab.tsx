'use client'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

interface Result { section: string; text: string; sub?: string }

export default function SearchTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const found: Result[] = []
    const search = (key: string, section: string, textFn: (item: any) => string, subFn?: (item: any) => string) => {
      try {
        const raw = localStorage.getItem(key); if (!raw) return
        const parsed = JSON.parse(raw); const arr = parsed?.data ?? parsed
        if (!Array.isArray(arr)) return
        arr.forEach((item: any) => { const text = textFn(item); if (text.toLowerCase().includes(q)) found.push({ section, text, sub: subFn?.(item) }) })
      } catch {}
    }
    search('los_goals_today', 'Goals · Today', (g: any) => g.text, (g: any) => g.done ? 'Done' : 'Pending')
    search('los_p_goals_tomorrow', 'Goals · Tomorrow', (g: any) => g.text)
    search('los_p_planner_tasks', 'Planner', (t: any) => t.text, (t: any) => `${t.category} · ${t.date}`)
    search('los_p_supplements', 'Supplements', (s: any) => s.name, (s: any) => `${s.dose} · ${s.time_of_day}`)
    search('los_p_ideas', 'Brand · Ideas', (i: any) => i.text, (i: any) => i.shipped ? 'Shipped' : 'Pending')
    search('los_p_subscriptions', 'Finances · Subscriptions', (s: any) => s.name, (s: any) => `${s.currency} ${s.amount}/${s.period}`)
    search('los_p_haul_items', 'Finances · Haul', (h: any) => h.name, (h: any) => `CHF ${h.cost}`)
    try {
      const buyRaw = localStorage.getItem('los_p_wants_buy'); const futRaw = localStorage.getItem('los_p_wants_future')
      if (buyRaw) JSON.parse(buyRaw).forEach((w: string) => { if (w.toLowerCase().includes(q)) found.push({ section: 'Finances · Wants', text: w, sub: 'To Buy' }) })
      if (futRaw) JSON.parse(futRaw).forEach((w: string) => { if (w.toLowerCase().includes(q)) found.push({ section: 'Finances · Wants', text: w, sub: 'Future' }) })
    } catch {}
    try {
      const raw = localStorage.getItem('los_p_gym_history')
      if (raw) (JSON.parse(raw) || []).forEach((log: any) => (log.exercises || []).forEach((ex: any) => {
        if (ex.name.toLowerCase().includes(q)) found.push({ section: 'Gym · History', text: ex.name, sub: log.date })
      }))
    } catch {}
    setResults(found)
  }, [query])

  const grouped: Record<string, Result[]> = {}
  results.forEach(r => { if (!grouped[r.section]) grouped[r.section] = []; grouped[r.section].push(r) })

  return (
    <PageShell>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#111', border: '1px solid #222', borderRadius: 6, padding: '0 16px', marginBottom: 28 }}>
        <Search size={18} color="#6B7280" />
        <input type="text" placeholder="Search everything..." value={query} onChange={e => setQuery(e.target.value)} autoFocus
          style={{ background: 'transparent', border: 'none', flex: 1, padding: '14px 0', fontSize: '1rem', outline: 'none', color: '#F3F4F6' }} />
        {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '1rem' }}>×</button>}
      </div>
      {query && results.length === 0 && <div style={{ textAlign: 'center', color: '#374151', fontSize: '0.85rem', padding: '48px 0' }}>No results for "{query}"</div>}
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section} style={{ marginBottom: 24 }}>
          <div className="section-header">{section}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 4, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  {item.text.split(new RegExp(`(${query})`, 'gi')).map((part, pi) =>
                    part.toLowerCase() === query.toLowerCase()
                      ? <mark key={pi} style={{ background: '#92400E', color: '#F59E0B', borderRadius: 2, padding: '0 2px' }}>{part}</mark>
                      : part
                  )}
                </div>
                {item.sub && <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: 4 }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      {!query && (
        <div style={{ color: '#2a2a2a', fontSize: '0.82rem', lineHeight: 2.5, textAlign: 'center', paddingTop: 48 }}>
          Goals · Supplements · Brand Ideas · Subscriptions · Haul · Wishlist · Gym
        </div>
      )}
    </PageShell>
  )
}
