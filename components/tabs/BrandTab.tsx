'use client'
import { usePersistentStore, useDailyStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'

interface SocialPlatform { name: string; count: number; history: number[] }
interface Reflection { id: string; date: string; text: string }
interface Idea { id: string; text: string; shipped: boolean }

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube'] as const

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <div style={{ width: 60, height: 24, background: '#1a1a1a', borderRadius: 3 }} />
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  const w = 60, h = 24
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(' ')} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function BrandTab() {
  const [brand, setBrand] = usePersistentStore('brand_info', { name: 'My Brand', tagline: 'Your tagline here' })
  const [socials, setSocials] = usePersistentStore<Record<string, SocialPlatform>>('socials', {
    TikTok: { name: 'TikTok', count: 0, history: [] },
    Instagram: { name: 'Instagram', count: 0, history: [] },
    YouTube: { name: 'YouTube', count: 0, history: [] },
  })
  const [reflections, setReflections] = usePersistentStore<Reflection[]>('reflections', [])
  const [refText, setRefText] = useState('')
  const [posts, setPosts] = useDailyStore('posts_today', 0)
  const [ideas, setIdeas] = usePersistentStore<Idea[]>('ideas', [])
  const [ideaInput, setIdeaInput] = useState('')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newCount, setNewCount] = useState('')
  const [editingTagline, setEditingTagline] = useState(false)

  function updateCount(platform: string) {
    const n = parseInt(newCount); if (isNaN(n)) return
    setSocials(s => ({ ...s, [platform]: { ...s[platform], history: [...(s[platform].history || []).slice(-4), s[platform].count], count: n } }))
    setEditingTag(null); setNewCount('')
  }

  function saveReflection() {
    if (!refText.trim()) return
    setReflections(r => [...r, { id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), text: refText.trim() }])
    setRefText('')
  }

  function addIdea() {
    if (!ideaInput.trim()) return
    setIdeas(i => [...i, { id: Date.now().toString(), text: ideaInput.trim(), shipped: false }])
    setIdeaInput('')
  }

  const BrandHeader = (
    <div className="card">
      <div className="section-header">Personal Brand</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{brand.name}</div>
      {editingTagline ? (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input type="text" value={brand.tagline} onChange={e => setBrand(b => ({ ...b, tagline: e.target.value }))} style={{ flex: 1 }} />
          <button onClick={() => setEditingTagline(false)} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 4, padding: '0 12px', cursor: 'pointer' }}>✓</button>
        </div>
      ) : (
        <div onClick={() => setEditingTagline(true)} style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4, cursor: 'pointer' }}>
          {brand.tagline} <span style={{ color: '#374151', fontSize: '0.6rem' }}>· tap to edit</span>
        </div>
      )}
    </div>
  )

  const SocialCounts = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Social Counts</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} className="animate-pulse-slow" />
          <span style={{ fontSize: '0.6rem', color: '#22C55E', fontWeight: 700 }}>LIVE</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PLATFORMS.map(p => {
          const s = socials[p]
          const delta = s.history.length > 0 ? s.count - s.history[s.history.length - 1] : 0
          return (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 2 }}>{p}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F3F4F6' }}>{s.count.toLocaleString()}</div>
                {delta !== 0 && <div style={{ fontSize: '0.65rem', color: delta > 0 ? '#22C55E' : '#EF4444' }}>{delta > 0 ? '+' : ''}{delta}</div>}
              </div>
              <Sparkline data={[...s.history, s.count]} />
              {editingTag === p ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="number" value={newCount} onChange={e => setNewCount(e.target.value)} style={{ width: 80 }} autoFocus onKeyDown={e => e.key === 'Enter' && updateCount(p)} />
                  <button onClick={() => updateCount(p)} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}>✓</button>
                </div>
              ) : (
                <button onClick={() => { setEditingTag(p); setNewCount(s.count.toString()) }} className="btn-ghost" style={{ fontSize: '0.7rem', padding: '6px 10px' }}>Update</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const DailyReflection = (
    <div className="card">
      <div className="section-header">Daily Reflection</div>
      <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 6 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: 8, fontStyle: 'italic' }}>Where is the account going? What's working? What's failing? What to do next?</div>
      <textarea value={refText} onChange={e => setRefText(e.target.value)} rows={4} placeholder="Write your reflection..." style={{ marginBottom: 8, resize: 'vertical' }} />
      <button onClick={saveReflection} className="btn-amber">Save Reflection</button>
      {reflections.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.65rem', color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Past</div>
          {reflections.slice().reverse().slice(0, 3).map(r => (
            <details key={r.id} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '8px 12px' }}>
              <summary style={{ fontSize: '0.72rem', color: '#6B7280', cursor: 'pointer', listStyle: 'none' }}>{r.date}</summary>
              <div style={{ fontSize: '0.78rem', color: '#E5E7EB', marginTop: 8, lineHeight: 1.6 }}>{r.text}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  )

  const PostCounter = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Content Posted Today</div>
        <span style={{ fontSize: '0.75rem', color: posts >= 1 ? '#22C55E' : '#6B7280', fontWeight: 700 }}>{posts}/1</span>
      </div>
      <button onClick={() => setPosts((p: number) => p + 1)} className="btn-amber" style={{ marginBottom: 8 }}>Posted one ↑</button>
      {posts > 0 && <button onClick={() => setPosts((p: number) => Math.max(0, p - 1))} className="btn-ghost" style={{ width: '100%' }}>Undo</button>}
    </div>
  )

  const IdeaBank = (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Idea Bank</div>
        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{ideas.length} ideas</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input type="text" placeholder="Content idea..." value={ideaInput} onChange={e => setIdeaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIdea()} style={{ flex: 1 }} />
        <button onClick={addIdea} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ideas.map(idea => (
          <div key={idea.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#181818', border: `1px solid ${idea.shipped ? '#166534' : '#222'}`, borderRadius: 4, padding: '8px 12px' }}>
            <button onClick={() => setIdeas(is => is.map(x => x.id === idea.id ? { ...x, shipped: !x.shipped } : x))}
              style={{ width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${idea.shipped ? '#22C55E' : '#374151'}`, background: idea.shipped ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {idea.shipped && <Check size={11} color="#000" strokeWidth={3} />}
            </button>
            <span style={{ flex: 1, fontSize: '0.8rem', color: idea.shipped ? '#4B5563' : '#E5E7EB', textDecoration: idea.shipped ? 'line-through' : 'none' }}>{idea.text}</span>
            {idea.shipped && <span style={{ fontSize: '0.62rem', color: '#22C55E', fontWeight: 600 }}>SHIPPED</span>}
            <button onClick={() => setIdeas(is => is.filter(x => x.id !== idea.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 32 }}>
      <DesktopGrid columns={3}>
        {BrandHeader}
        {SocialCounts}
        {DailyReflection}
        {PostCounter}
        {IdeaBank}
      </DesktopGrid>
    </div>
  )
}
