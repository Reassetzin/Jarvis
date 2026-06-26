'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Target, Gamepad2 } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

const CATEGORIES = ['Building', '3D Modeling', 'UI', 'Scripting', 'Audio', 'Game Design'] as const
type Category = typeof CATEGORIES[number]
const CAT_COLORS: Record<string, string> = {
  'Building': '#F59E0B', '3D Modeling': '#8B5CF6', 'UI': '#3B82F6',
  'Scripting': '#22C55E', 'Audio': '#EC4899', 'Game Design': '#EAB308',
}

interface Task { id: string; text: string; category: Category; done: boolean; assignee?: string }
interface Milestone { id: string; name: string; tasks: Task[]; targetDate?: string; done: boolean }
interface Update { id: string; date: string; note: string }
interface Doc { id: string; emoji: string; title: string; content: string }
interface Project {
  id: string; name: string; description: string; status: 'planning' | 'active' | 'paused' | 'launched'
  links: { label: string; url: string }[]
  milestones: Milestone[]
  updates: Update[]
  notes: string
  docs: Doc[]
}

const STATUS_META = {
  planning: { label: 'Planning', color: '#6B7280' },
  active: { label: 'Active', color: '#22C55E' },
  paused: { label: 'Paused', color: '#F59E0B' },
  launched: { label: 'Launched', color: '#8B5CF6' },
}

function milestoneProgress(m: Milestone) {
  if (m.tasks.length === 0) return m.done ? 100 : 0
  return Math.round((m.tasks.filter(t => t.done).length / m.tasks.length) * 100)
}
function projectProgress(p: Project) {
  if (p.milestones.length === 0) return 0
  return Math.round(p.milestones.reduce((a, m) => a + milestoneProgress(m), 0) / p.milestones.length)
}

export default function ProjectsTab() {
  const [projects, setProjects] = usePersistentStore<Project[]>('roblox_projects', [])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const active = projects.find(p => p.id === activeId)

  function createProject() {
    if (!newName.trim()) return
    const p: Project = { id: Date.now().toString(), name: newName.trim(), description: '', status: 'planning', links: [], milestones: [], updates: [], notes: '', docs: [] }
    setProjects(ps => [...ps, p]); setActiveId(p.id); setNewName(''); setCreating(false)
  }
  function updateProject(fn: (p: Project) => Project) {
    setProjects(ps => ps.map(p => p.id === active?.id ? fn(p) : p))
  }

  if (!active) {
    return (
      <PageShell>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gamepad2 size={22} color="#F59E0B" />
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Projects</h1>
          </div>
          {!creating && <button onClick={() => setCreating(true)} className="btn-amber" style={{ width: 'auto', padding: '8px 16px' }}><Plus size={14} style={{ display: 'inline', marginRight: 4 }} />New Project</button>}
        </div>

        {creating && (
          <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Project name (e.g. Run a Laundromat)" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} autoFocus style={{ flex: 1 }} />
            <button onClick={createProject} className="btn-amber" style={{ width: 'auto', padding: '10px 18px' }}>Create</button>
            <button onClick={() => setCreating(false)} className="btn-ghost">Cancel</button>
          </div>
        )}

        {projects.length === 0 && !creating && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>No projects yet. Create your first Roblox project.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const prog = projectProgress(p)
            const totalTasks = p.milestones.reduce((a, m) => a + m.tasks.length, 0)
            const doneTasks = p.milestones.reduce((a, m) => a + m.tasks.filter(t => t.done).length, 0)
            return (
              <button key={p.id} onClick={() => setActiveId(p.id)} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: '0.6rem', color: STATUS_META[p.status].color, background: `${STATUS_META[p.status].color}18`, border: `1px solid ${STATUS_META[p.status].color}40`, borderRadius: 10, padding: '2px 8px', fontWeight: 600 }}>{STATUS_META[p.status].label}</span>
                </div>
                {p.description && <p style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: 10, lineHeight: 1.4 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>}
                <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${prog}%`, background: prog >= 100 ? '#22C55E' : '#F59E0B', borderRadius: 4, transition: 'width 0.5s', boxShadow: `0 0 8px ${prog >= 100 ? '#22C55E' : '#F59E0B'}80` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#6B7280' }}>
                  <span>{prog}% complete</span>
                  <span>{p.milestones.length} milestones · {doneTasks}/{totalTasks} tasks</span>
                </div>
              </button>
            )
          })}
        </div>
      </PageShell>
    )
  }

  return <ProjectDetail project={active} onBack={() => setActiveId(null)} update={updateProject} onDelete={() => { setProjects(ps => ps.filter(p => p.id !== active.id)); setActiveId(null) }} />
}

function ProjectDetail({ project, onBack, update, onDelete }: { project: Project; onBack: () => void; update: (fn: (p: Project) => Project) => void; onDelete: () => void }) {
  const [tab, setTab] = useState<'tasks' | 'progress' | 'docs' | 'updates' | 'info'>('tasks')
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all')
  const [taskInput, setTaskInput] = useState('')
  const [taskCat, setTaskCat] = useState<Category>('Scripting')
  const [activeMilestone, setActiveMilestone] = useState<string | null>(project.milestones[0]?.id || null)
  const [msInput, setMsInput] = useState('')
  const [updateInput, setUpdateInput] = useState('')
  const [editingInfo, setEditingInfo] = useState(false)
  const [linkLabel, setLinkLabel] = useState(''); const [linkUrl, setLinkUrl] = useState('')
  const [activeDoc, setActiveDoc] = useState<string | null>(project.docs?.[0]?.id || null)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocEmoji, setNewDocEmoji] = useState('📄')

  const prog = projectProgress(project)
  const ms = project.milestones.find(m => m.id === activeMilestone)

  function addMilestone() {
    if (!msInput.trim()) return
    const m: Milestone = { id: Date.now().toString(), name: msInput.trim(), tasks: [], done: false }
    update(p => ({ ...p, milestones: [...p.milestones, m] }))
    setActiveMilestone(m.id); setMsInput('')
  }
  function addTask() {
    if (!taskInput.trim() || !activeMilestone) return
    update(p => ({ ...p, milestones: p.milestones.map(m => m.id === activeMilestone ? { ...m, tasks: [...m.tasks, { id: Date.now().toString(), text: taskInput.trim(), category: taskCat, done: false }] } : m) }))
    setTaskInput('')
  }
  function toggleTask(mId: string, tId: string) {
    update(p => ({ ...p, milestones: p.milestones.map(m => m.id === mId ? { ...m, tasks: m.tasks.map(t => t.id === tId ? { ...t, done: !t.done } : t) } : m) }))
  }
  function removeTask(mId: string, tId: string) {
    update(p => ({ ...p, milestones: p.milestones.map(m => m.id === mId ? { ...m, tasks: m.tasks.filter(t => t.id !== tId) } : m) }))
  }
  function addUpdate() {
    if (!updateInput.trim()) return
    update(p => ({ ...p, updates: [{ id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), note: updateInput.trim() }, ...p.updates] }))
    setUpdateInput('')
  }
  function addDoc() {
    if (!newDocTitle.trim()) return
    const d: Doc = { id: Date.now().toString(), emoji: newDocEmoji || '📄', title: newDocTitle.trim(), content: '' }
    update(p => ({ ...p, docs: [...(p.docs || []), d] }))
    setActiveDoc(d.id); setNewDocTitle(''); setNewDocEmoji('📄')
  }
  function updateDoc(id: string, fn: (d: Doc) => Doc) {
    update(p => ({ ...p, docs: (p.docs || []).map(d => d.id === id ? fn(d) : d) }))
  }

  const visibleTasks = ms ? (catFilter === 'all' ? ms.tasks : ms.tasks.filter(t => t.category === catFilter)) : []
  const catCounts: Record<string, { done: number; total: number }> = {}
  project.milestones.forEach(m => m.tasks.forEach(t => {
    if (!catCounts[t.category]) catCounts[t.category] = { done: 0, total: 0 }
    catCounts[t.category].total++; if (t.done) catCounts[t.category].done++
  }))

  return (
    <PageShell>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: '#181818', border: '1px solid #333', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><ChevronLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{project.name}</h1>
            <select value={project.status} onChange={e => update(p => ({ ...p, status: e.target.value as any }))} style={{ width: 'auto', fontSize: '0.7rem', padding: '3px 8px' }}>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: prog >= 100 ? '#22C55E' : '#F59E0B' }}>{prog}%</div>
          <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>overall</div>
        </div>
        <button onClick={() => { if (confirm(`Delete project "${project.name}"?`)) onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={16} /></button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['tasks', 'progress', 'docs', 'updates', 'info'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#1a0a00' : 'transparent', border: `1px solid ${tab === t ? '#92400E' : '#333'}`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer', color: tab === t ? '#F59E0B' : '#9CA3AF', fontWeight: tab === t ? 700 : 500, fontSize: '0.78rem', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* TASKS */}
      {tab === 'tasks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
          {/* Milestone list */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <div className="section-header">Milestones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {project.milestones.map(m => {
                const mp = milestoneProgress(m)
                return (
                  <button key={m.id} onClick={() => setActiveMilestone(m.id)} style={{ textAlign: 'left', background: activeMilestone === m.id ? '#1a0a00' : '#181818', border: `1px solid ${activeMilestone === m.id ? '#92400E' : '#222'}`, borderRadius: 6, padding: '8px 10px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: activeMilestone === m.id ? '#F59E0B' : '#E5E7EB' }}>{m.name}</span>
                      <span style={{ fontSize: '0.62rem', color: mp >= 100 ? '#22C55E' : '#6B7280', fontWeight: 700 }}>{mp}%</span>
                    </div>
                    <div style={{ height: 4, background: '#0a0a0a', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${mp}%`, background: mp >= 100 ? '#22C55E' : '#F59E0B', borderRadius: 2 }} />
                    </div>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <input type="text" placeholder="New milestone" value={msInput} onChange={e => setMsInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMilestone()} style={{ flex: 1, fontSize: '0.75rem', padding: '7px 9px' }} />
              <button onClick={addMilestone} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          </div>

          {/* Tasks for active milestone */}
          <div className="card">
            {ms ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div className="section-header" style={{ marginBottom: 0 }}>{ms.name}</div>
                  <button onClick={() => { if (confirm('Delete this milestone?')) { update(p => ({ ...p, milestones: p.milestones.filter(x => x.id !== ms.id) })); setActiveMilestone(null) } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={14} /></button>
                </div>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button onClick={() => setCatFilter('all')} style={{ background: catFilter === 'all' ? '#333' : 'transparent', border: '1px solid #333', borderRadius: 12, padding: '3px 10px', cursor: 'pointer', color: catFilter === 'all' ? '#fff' : '#6B7280', fontSize: '0.65rem' }}>All</button>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter === c ? `${CAT_COLORS[c]}22` : 'transparent', border: `1px solid ${catFilter === c ? CAT_COLORS[c] : '#333'}`, borderRadius: 12, padding: '3px 10px', cursor: 'pointer', color: catFilter === c ? CAT_COLORS[c] : '#6B7280', fontSize: '0.65rem' }}>{c}</button>
                  ))}
                </div>
                {/* Task list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                  {visibleTasks.length === 0 && <div style={{ fontSize: '0.74rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>No tasks here yet.</div>}
                  {visibleTasks.map(t => (
                    <div key={t.id} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391590' : '#222'}`, borderRadius: 6, padding: '8px 10px' }}>
                      <button onClick={() => toggleTask(ms.id, t.id)} className={t.done ? 'check-pop' : ''} style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {t.done && <Check size={10} color="#000" strokeWidth={3} />}
                      </button>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[t.category], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.8rem', color: t.done ? '#4B5563' : '#F3F4F6', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                      <span style={{ fontSize: '0.56rem', color: CAT_COLORS[t.category] }}>{t.category}</span>
                      <button onClick={() => removeTask(ms.id, t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
                {/* Add task */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={taskCat} onChange={e => setTaskCat(e.target.value as Category)} style={{ width: 'auto', fontSize: '0.72rem' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Add task..." value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ flex: 1 }} />
                  <button onClick={addTask} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 6, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#374151', textAlign: 'center', padding: '40px 0' }}>Select or create a milestone to add tasks.</div>
            )}
          </div>
        </div>
      )}

      {/* PROGRESS */}
      {tab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-header">Overall Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: prog >= 100 ? '#22C55E' : '#F59E0B' }}>{prog}%</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: '#1f1f1f', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prog}%`, background: prog >= 100 ? '#22C55E' : '#F59E0B', borderRadius: 6, transition: 'width 0.6s', boxShadow: `0 0 12px ${prog >= 100 ? '#22C55E' : '#F59E0B'}80` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="section-header">Milestones</div>
            {project.milestones.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No milestones yet.</div>}
            {project.milestones.map(m => {
              const mp = milestoneProgress(m)
              return (
                <div key={m.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</span>
                    <span style={{ fontSize: '0.72rem', color: mp >= 100 ? '#22C55E' : '#9CA3AF', fontWeight: 700 }}>{mp}% · {m.tasks.filter(t => t.done).length}/{m.tasks.length}</span>
                  </div>
                  <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${mp}%`, background: mp >= 100 ? '#22C55E' : '#F59E0B', borderRadius: 4, transition: 'width 0.6s' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="card">
            <div className="section-header">By Category</div>
            {Object.keys(catCounts).length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No tasks yet.</div>}
            {Object.entries(catCounts).map(([cat, c]) => {
              const cp = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_COLORS[cat] }} />
                      <span style={{ fontSize: '0.76rem' }}>{cat}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{c.done}/{c.total}</span>
                  </div>
                  <div style={{ height: 6, background: '#1f1f1f', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cp}%`, background: CAT_COLORS[cat], borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DOCS / GDD */}
      {tab === 'docs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
          {/* Doc list */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <div className="section-header">Documents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(project.docs || []).map(d => (
                <button key={d.id} onClick={() => setActiveDoc(d.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', background: activeDoc === d.id ? '#1a0a00' : '#181818', border: `1px solid ${activeDoc === d.id ? '#92400E' : '#222'}`, borderRadius: 6, padding: '8px 10px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.9rem' }}>{d.emoji}</span>
                  <span style={{ flex: 1, fontSize: '0.76rem', fontWeight: activeDoc === d.id ? 600 : 400, color: activeDoc === d.id ? '#F59E0B' : '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
              <input type="text" value={newDocEmoji} onChange={e => setNewDocEmoji(e.target.value)} maxLength={2} style={{ width: 44, textAlign: 'center', padding: '7px 4px' }} title="Emoji" />
              <input type="text" placeholder="New doc title" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDoc()} style={{ flex: 1, fontSize: '0.72rem', padding: '7px 8px' }} />
              <button onClick={addDoc} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 6, padding: '0 11px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
            {(project.docs || []).length === 0 && <p style={{ fontSize: '0.62rem', color: '#374151', marginTop: 8, lineHeight: 1.4 }}>Create a doc per GDD topic (Core Loop, Machines, Monetization, etc.) like your Discord channels.</p>}
          </div>

          {/* Doc editor */}
          <div className="card">
            {(() => {
              const doc = (project.docs || []).find(d => d.id === activeDoc)
              if (!doc) return <div style={{ fontSize: '0.8rem', color: '#374151', textAlign: 'center', padding: '40px 0' }}>Select or create a document.</div>
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <input type="text" value={doc.emoji} onChange={e => updateDoc(doc.id, d => ({ ...d, emoji: e.target.value }))} maxLength={2} style={{ width: 48, textAlign: 'center', fontSize: '1.1rem', padding: '6px 4px' }} />
                    <input type="text" value={doc.title} onChange={e => updateDoc(doc.id, d => ({ ...d, title: e.target.value }))} style={{ flex: 1, fontSize: '1rem', fontWeight: 700 }} />
                    <button onClick={() => { if (confirm(`Delete "${doc.title}"?`)) { update(p => ({ ...p, docs: (p.docs || []).filter(x => x.id !== doc.id) })); setActiveDoc(null) } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={16} /></button>
                  </div>
                  <textarea
                    value={doc.content}
                    onChange={e => updateDoc(doc.id, d => ({ ...d, content: e.target.value }))}
                    placeholder={"Paste or write your full doc here.\n\nUse arrows, emoji, and line breaks just like Discord:\n\n⚡ CHAOS EVENTS\nRandom mid-session disruptions...\n\n🔴 MACHINE OVERLOAD\n→ One or more machines break down\n→ Player must intervene"}
                    style={{ width: '100%', minHeight: 460, resize: 'vertical', fontSize: '0.85rem', lineHeight: 1.7, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                  />
                  <div style={{ fontSize: '0.6rem', color: '#374151', marginTop: 8 }}>Line breaks and emoji are preserved. Paste straight from your Discord GDD.</div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* UPDATES */}
      {tab === 'updates' && (
        <div className="card">
          <div className="section-header">Update Log & Plans</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <input type="text" placeholder="Log an update or planned change..." value={updateInput} onChange={e => setUpdateInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUpdate()} style={{ flex: 1 }} />
            <button onClick={addUpdate} className="btn-amber" style={{ width: 'auto', padding: '10px 16px' }}>Log</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.updates.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No updates logged yet.</div>}
            {project.updates.map(u => (
              <div key={u.id} className="item-enter" style={{ display: 'flex', gap: 10, background: '#181818', border: '1px solid #222', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.6rem', color: '#F59E0B', fontWeight: 600, minWidth: 56, paddingTop: 2 }}>{u.date}</div>
                <div style={{ flex: 1, fontSize: '0.8rem', color: '#E5E7EB', lineHeight: 1.5 }}>{u.note}</div>
                <button onClick={() => update(p => ({ ...p, updates: p.updates.filter(x => x.id !== u.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INFO */}
      {tab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="section-header" style={{ marginBottom: 0 }}>Description</div>
              <button onClick={() => setEditingInfo(e => !e)} className="btn-ghost" style={{ fontSize: '0.7rem' }}>{editingInfo ? 'Done' : 'Edit'}</button>
            </div>
            {editingInfo ? (
              <textarea rows={3} value={project.description} onChange={e => update(p => ({ ...p, description: e.target.value }))} placeholder="What is this game about?" style={{ resize: 'vertical' }} />
            ) : (
              <p style={{ fontSize: '0.82rem', color: project.description ? '#E5E7EB' : '#374151', lineHeight: 1.6 }}>{project.description || 'No description yet. Click Edit.'}</p>
            )}
          </div>

          <div className="card">
            <div className="section-header">Links</div>
            {project.links.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #111' }}>
                <span style={{ fontSize: '0.76rem', color: '#9CA3AF', minWidth: 90 }}>{l.label}</span>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: '0.74rem', color: '#3B82F6', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.url}</a>
                <button onClick={() => update(p => ({ ...p, links: p.links.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <input type="text" placeholder="Label (e.g. Discord)" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} style={{ flex: 1 }} />
              <input type="text" placeholder="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{ flex: 2 }} />
              <button onClick={() => { if (!linkLabel.trim() || !linkUrl.trim()) return; update(p => ({ ...p, links: [...p.links, { label: linkLabel.trim(), url: linkUrl.trim() }] })); setLinkLabel(''); setLinkUrl('') }} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 6, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
