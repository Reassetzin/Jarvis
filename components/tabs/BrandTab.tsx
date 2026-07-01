'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus, Check, ChevronDown } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'
import IdeaEditor, { Idea as FullIdea } from '@/components/brand/IdeaEditor'
import PageShell from '@/components/ui/PageShell'

interface Account { id: string; platform: string; handle: string; followers: number; history: number[] }
interface Idea { id: string; text: string; status: 'idea' | 'planned' | 'shipped'; notes?: string; date?: string; platform?: string; hook?: string; script?: string }
interface Brand {
  id: string; name: string; tagline: string
  accounts: Account[]; ideas: Idea[]
}

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X', 'LinkedIn', 'Other']
const STATUS_META = { idea: { label: 'Idea', color: '#6B7280' }, planned: { label: 'Planned', color: 'var(--accent)' }, shipped: { label: 'Shipped', color: '#22C55E' } }

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <div style={{ width: 50, height: 20, background: '#1a1a1a', borderRadius: 3 }} />
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  const w = 50, h = 20
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
  return <svg width={w} height={h}><polyline points={pts.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="1.5" /></svg>
}

export default function BrandTab() {
  const [brands, setBrands] = usePersistentStore<Brand[]>('brands', [])
  const [activeBrandId, setActiveBrandId] = usePersistentStore<string | null>('active_brand', null)
  const [newBrandName, setNewBrandName] = useState('')
  const [addingBrand, setAddingBrand] = useState(false)
  const [acctForm, setAcctForm] = useState({ platform: 'TikTok', handle: '' })
  const [addingAcct, setAddingAcct] = useState(false)
  const [ideaInput, setIdeaInput] = useState('')
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [editingFollowers, setEditingFollowers] = useState<string | null>(null)
  const [followerInput, setFollowerInput] = useState('')
  const [editingTagline, setEditingTagline] = useState(false)

  const active = brands.find(b => b.id === activeBrandId) || brands[0]

  function addBrand() {
    if (!newBrandName.trim()) return
    const b: Brand = { id: Date.now().toString(), name: newBrandName.trim(), tagline: 'Add a tagline', accounts: [], ideas: [] }
    setBrands(bs => [...bs, b]); setActiveBrandId(b.id); setNewBrandName(''); setAddingBrand(false)
  }
  function updateActive(fn: (b: Brand) => Brand) {
    setBrands(bs => bs.map(b => b.id === active?.id ? fn(b) : b))
  }
  function addAccount() {
    if (!acctForm.handle.trim() || !active) return
    updateActive(b => ({ ...b, accounts: [...b.accounts, { id: Date.now().toString(), platform: acctForm.platform, handle: acctForm.handle.trim(), followers: 0, history: [] }] }))
    setAcctForm({ platform: 'TikTok', handle: '' }); setAddingAcct(false)
  }
  function updateFollowers(acctId: string) {
    const n = parseInt(followerInput); if (isNaN(n)) return
    updateActive(b => ({ ...b, accounts: b.accounts.map(a => a.id === acctId ? { ...a, history: [...a.history.slice(-4), a.followers], followers: n } : a) }))
    setEditingFollowers(null); setFollowerInput('')
  }
  function addIdea() {
    if (!ideaInput.trim() || !active) return
    updateActive(b => ({ ...b, ideas: [...b.ideas, { id: Date.now().toString(), text: ideaInput.trim(), status: 'idea' }] }))
    setIdeaInput('')
  }
  function cycleStatus(ideaId: string) {
    const order: Idea['status'][] = ['idea', 'planned', 'shipped']
    updateActive(b => ({ ...b, ideas: b.ideas.map(i => i.id === ideaId ? { ...i, status: order[(order.indexOf(i.status) + 1) % 3] } : i) }))
  }

  if (brands.length === 0) {
    return (
      <PageShell>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="section-header" style={{ display: 'inline-block' }}>Brands</div>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '12px 0 20px' }}>Create your first brand to start tracking accounts and content.</p>
          <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
            <input type="text" placeholder="Brand name (e.g. OrbitReach)" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} style={{ flex: 1 }} />
            <button onClick={addBrand} className="btn-amber" style={{ width: 'auto', padding: '10px 20px' }}>Create</button>
          </div>
        </div>
      </PageShell>
    )
  }

  const totalFollowers = active?.accounts.reduce((a, x) => a + x.followers, 0) || 0
  const grouped = { idea: active?.ideas.filter(i => i.status === 'idea') || [], planned: active?.ideas.filter(i => i.status === 'planned') || [], shipped: active?.ideas.filter(i => i.status === 'shipped') || [] }

  return (
    <PageShell>
      {/* Brand switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {brands.map(b => (
          <button key={b.id} onClick={() => setActiveBrandId(b.id)} style={{
            background: active?.id === b.id ? '#1a0a00' : '#111',
            border: `1px solid ${active?.id === b.id ? 'var(--accent-dim)' : '#222'}`,
            borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
            color: active?.id === b.id ? 'var(--accent)' : '#9CA3AF', fontWeight: active?.id === b.id ? 700 : 500, fontSize: '0.85rem',
          }}>{b.name}</button>
        ))}
        {addingBrand ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" placeholder="Brand name" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()} style={{ width: 160 }} autoFocus />
            <button className="glow-orange" onClick={addBrand} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>✓</button>
          </div>
        ) : (
          <button onClick={() => setAddingBrand(true)} className="btn-ghost" style={{ padding: '8px 14px' }}><Plus size={13} style={{ display: 'inline' }} /> Brand</button>
        )}
      </div>

      {active && (
        <>
          {/* Brand header */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{active.name}</div>
              {editingTagline ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input type="text" value={active.tagline} onChange={e => updateActive(b => ({ ...b, tagline: e.target.value }))} style={{ flex: 1 }} />
                  <button onClick={() => setEditingTagline(false)} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div onClick={() => setEditingTagline(true)} style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2, cursor: 'pointer' }}>{active.tagline} <span style={{ fontSize: '0.6rem', color: '#374151' }}>· edit</span></div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>Total reach</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{totalFollowers.toLocaleString()}</div>
            </div>
            <button onClick={() => { if (confirm(`Delete brand "${active.name}"?`)) { setBrands(bs => bs.filter(b => b.id !== active.id)); setActiveBrandId(null) } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={16} /></button>
          </div>

          <DesktopGrid columns={2}>
            {/* Accounts */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-header" style={{ marginBottom: 0 }}>Accounts</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div className="animate-pulse-slow" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: '0.6rem', color: '#22C55E', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {active.accounts.map(a => {
                  const delta = a.history.length > 0 ? a.followers - a.history[a.history.length - 1] : 0
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>{a.platform} · @{a.handle}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{a.followers.toLocaleString()}</div>
                        {delta !== 0 && <div style={{ fontSize: '0.62rem', color: delta > 0 ? '#22C55E' : '#EF4444' }}>{delta > 0 ? '+' : ''}{delta}</div>}
                      </div>
                      <Sparkline data={[...a.history, a.followers]} />
                      {editingFollowers === a.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input type="number" value={followerInput} onChange={e => setFollowerInput(e.target.value)} style={{ width: 70 }} autoFocus onKeyDown={e => e.key === 'Enter' && updateFollowers(a.id)} />
                          <button className="glow-orange" onClick={() => updateFollowers(a.id)} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', fontWeight: 700 }}>✓</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingFollowers(a.id); setFollowerInput(a.followers.toString()) }} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '5px 8px' }}>Update</button>
                      )}
                      <button onClick={() => updateActive(b => ({ ...b, accounts: b.accounts.filter(x => x.id !== a.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                    </div>
                  )
                })}
              </div>
              {addingAcct ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <select value={acctForm.platform} onChange={e => setAcctForm(f => ({ ...f, platform: e.target.value }))} style={{ flex: 1 }}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select>
                  <input type="text" placeholder="@handle" value={acctForm.handle} onChange={e => setAcctForm(f => ({ ...f, handle: e.target.value }))} style={{ flex: 1 }} />
                  <button className="glow-orange" onClick={addAccount} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              ) : (
                <button onClick={() => setAddingAcct(true)} className="btn-ghost" style={{ width: '100%', marginTop: 10 }}>+ Add Account</button>
              )}
            </div>

            {/* Content pipeline */}
            <div className="card">
              <div className="section-header">Content Pipeline</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input type="text" placeholder="New content idea..." value={ideaInput} onChange={e => setIdeaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIdea()} style={{ flex: 1 }} />
                <button className="glow-orange" onClick={addIdea} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
              {(['idea', 'planned', 'shipped'] as const).map(status => (
                <div key={status} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_META[status].color }} />
                    <span style={{ fontSize: '0.62rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em' }}>{STATUS_META[status].label.toUpperCase()}</span>
                    <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>· {grouped[status].length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {grouped[status].map(idea => (
                      <div key={idea.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '8px 12px' }}>
                        <button onClick={() => cycleStatus(idea.id)} title="Click to advance status" style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${STATUS_META[idea.status].color}`, background: idea.status === 'shipped' ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {idea.status === 'shipped' && <Check size={10} color="#000" strokeWidth={3} />}
                        </button>
                        <div onClick={() => setEditingIdea(idea)} style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', color: idea.status === 'shipped' ? '#4B5563' : '#E5E7EB', textDecoration: idea.status === 'shipped' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idea.text}</div>
                          {(idea.platform || idea.date) && (
                            <div style={{ fontSize: '0.58rem', color: '#4B5563', display: 'flex', gap: 6, marginTop: 1 }}>
                              {idea.platform && <span>{idea.platform}</span>}
                              {idea.date && <span>· {idea.date}</span>}
                              {idea.script && <span>· 📝</span>}
                            </div>
                          )}
                        </div>
                        <button onClick={() => updateActive(b => ({ ...b, ideas: b.ideas.filter(x => x.id !== idea.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '0.6rem', color: '#374151', marginTop: 4 }}>Checkbox advances status · Click an idea to add notes, hook & script</p>
            </div>
          </DesktopGrid>
        </>
      )}

      {editingIdea && (
        <IdeaEditor
          idea={editingIdea}
          onClose={() => setEditingIdea(null)}
          onSave={updated => updateActive(b => ({ ...b, ideas: b.ideas.map(x => x.id === updated.id ? updated : x) }))}
        />
      )}
    </PageShell>
  )
}
