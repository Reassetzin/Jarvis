'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface ContentIdea {
  id: string
  title: string
  shipped: boolean
  date: string
}

interface BrandProfile {
  name: string
  tagline: string
}

interface SocialFollowers {
  tiktok: number
  instagram: number
  youtube: number
}

export default function BrandTab() {
  const today = getLocalDate()

  const [social, setSocial] = useState<SocialFollowers>({ tiktok: 0, instagram: 0, youtube: 0 })
  const [posts, setPosts] = useState<Record<string, number>>({})
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [newIdea, setNewIdea] = useState('')
  const [profile, setProfile] = useState<BrandProfile>({ name: '', tagline: '' })
  const [reflections, setReflections] = useState<Record<string, string>>({})

  useEffect(() => {
    const s = localStorage.getItem('jarvis_brand_social')
    if (s) setSocial(JSON.parse(s) as SocialFollowers)
    const p = localStorage.getItem('jarvis_content_posts')
    if (p) setPosts(JSON.parse(p) as Record<string, number>)
    const i = localStorage.getItem('jarvis_content_ideas')
    if (i) setIdeas(JSON.parse(i) as ContentIdea[])
    const pr = localStorage.getItem('jarvis_brand_profile')
    if (pr) setProfile(JSON.parse(pr) as BrandProfile)
    const r = localStorage.getItem('jarvis_reflections')
    if (r) setReflections(JSON.parse(r) as Record<string, string>)
  }, [])

  const updateSocial = (platform: keyof SocialFollowers, delta: number) => {
    const updated = { ...social, [platform]: Math.max(0, social[platform] + delta) }
    setSocial(updated)
    localStorage.setItem('jarvis_brand_social', JSON.stringify(updated))
  }

  const updatePosts = (delta: number) => {
    const current = posts[today] || 0
    const updated = { ...posts, [today]: Math.max(0, current + delta) }
    setPosts(updated)
    localStorage.setItem('jarvis_content_posts', JSON.stringify(updated))
  }

  const addIdea = () => {
    if (!newIdea.trim()) return
    const updated = [...ideas, { id: newId(), title: newIdea, shipped: false, date: today }]
    setIdeas(updated)
    localStorage.setItem('jarvis_content_ideas', JSON.stringify(updated))
    setNewIdea('')
  }

  const toggleIdea = (id: string) => {
    const updated = ideas.map(i => i.id === id ? { ...i, shipped: !i.shipped } : i)
    setIdeas(updated)
    localStorage.setItem('jarvis_content_ideas', JSON.stringify(updated))
  }

  const saveProfile = () => {
    localStorage.setItem('jarvis_brand_profile', JSON.stringify(profile))
  }

  const updateReflection = (content: string) => {
    const updated = { ...reflections, [today]: content }
    setReflections(updated)
    localStorage.setItem('jarvis_reflections', JSON.stringify(updated))
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="section-header">BRAND PROFILE</div>
        <input className={`${inp} w-full mb-2`} placeholder="Name" value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })} />
        <input className={`${inp} w-full mb-2`} placeholder="Tagline" value={profile.tagline}
          onChange={e => setProfile({ ...profile, tagline: e.target.value })} />
        <button onClick={saveProfile} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">Save</button>
      </div>

      <div className="card">
        <div className="section-header">SOCIAL FOLLOWERS</div>
        {(['tiktok', 'instagram', 'youtube'] as const).map(platform => (
          <div key={platform} className="flex items-center justify-between mb-2">
            <span className="text-sm capitalize text-gray-300">{platform}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => updateSocial(platform, -1)} className="w-6 h-6 bg-[#222] rounded text-white text-sm">-</button>
              <span className="text-brand font-semibold w-16 text-center">{social[platform].toLocaleString()}</span>
              <button onClick={() => updateSocial(platform, 1)} className="w-6 h-6 bg-[#222] rounded text-white text-sm">+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header">POSTS TODAY</div>
        <div className="flex items-center gap-3">
          <button onClick={() => updatePosts(-1)} className="w-8 h-8 bg-[#222] rounded text-white">-</button>
          <span className="text-2xl font-bold text-brand">{posts[today] || 0}</span>
          <button onClick={() => updatePosts(1)} className="w-8 h-8 bg-[#222] rounded text-white">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">CONTENT IDEAS</div>
        {ideas.map(idea => (
          <div key={idea.id} className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={idea.shipped} onChange={() => toggleIdea(idea.id)} className="accent-brand" />
            <span className={`text-sm flex-1 ${idea.shipped ? 'line-through text-gray-600' : 'text-gray-300'}`}>{idea.title}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input className={`${inp} flex-1`} placeholder="New idea..." value={newIdea}
            onChange={e => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIdea()} />
          <button onClick={addIdea} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">TODAY&apos;S REFLECTION</div>
        <textarea
          className="w-full bg-black border border-[#333] rounded p-2 text-sm text-white resize-none"
          rows={4}
          placeholder="Reflect on today..."
          value={reflections[today] || ''}
          onChange={e => updateReflection(e.target.value)}
        />
      </div>
    </div>
  )
}
