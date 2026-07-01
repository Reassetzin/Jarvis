'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { Gamepad2 } from 'lucide-react'

interface Project { id: string; name: string; status: string; milestones: { tasks: { done: boolean }[] }[] }

function progress(p: Project) {
  if (!p.milestones || p.milestones.length === 0) return 0
  const per = p.milestones.map(m => m.tasks.length ? Math.round(m.tasks.filter(t => t.done).length / m.tasks.length * 100) : 0)
  return Math.round(per.reduce((a, b) => a + b, 0) / per.length)
}
const STATUS_COLORS: Record<string, string> = { planning: '#6B7280', active: '#22C55E', paused: 'var(--accent)', launched: '#8B5CF6' }

export default function ProjectsMini() {
  const [projects] = usePersistentStore<Project[]>('roblox_projects', [])

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Projects</div>
        <Gamepad2 size={14} color="var(--accent)" />
      </div>
      {projects.length === 0 ? (
        <div style={{ fontSize: '0.74rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>No projects yet.<br />Start one in the Projects tab.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects.slice(0, 4).map(p => {
            const prog = progress(p)
            return (
              <div key={p.id} style={{ background: '#181818', border: '1px solid #222', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: '0.62rem', color: STATUS_COLORS[p.status] || '#6B7280', fontWeight: 700 }}>{prog}%</span>
                </div>
                <div style={{ height: 5, background: '#0a0a0a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prog}%`, background: prog >= 100 ? '#22C55E' : 'var(--accent)', borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
