'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Plus, X, Check, ChevronDown, ChevronRight, ListTodo, Pencil, Tag, GripVertical } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

interface Todo { id: string; text: string; done: boolean; tags: string[]; doneTags?: string[] }
interface Group { id: string; name: string; color: string; todos: Todo[]; tags?: string[]; collapsed?: boolean; collapsedTags?: string[] }

const GROUP_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#F97316']
const UNTAGGED = '__untagged__'

export default function TodosTab() {
  const [groups, setGroups] = usePersistentStore<Group[]>('todo_groups', [])
  const [newGroup, setNewGroup] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [todoInputs, setTodoInputs] = useState<Record<string, string>>({})
  const [todoTags, setTodoTags] = useState<Record<string, string[]>>({})
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({})
  const [managingTags, setManagingTags] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editTodoText, setEditTodoText] = useState('')
  const [drag, setDrag] = useState<{ gid: string; tid: string } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const norm = (g: Group): Group & { tags: string[] } => ({ ...g, tags: g.tags || [], collapsedTags: g.collapsedTags || [], todos: g.todos.map(t => ({ ...t, tags: t.tags || [], doneTags: t.doneTags || [] })) })

  function addGroup() {
    if (!newGroup.trim()) return
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length]
    setGroups(g => [...g, { id: Date.now().toString(), name: newGroup.trim(), color, todos: [], tags: [] }])
    setNewGroup(''); setAddingGroup(false)
  }
  function removeGroup(id: string) { setGroups(g => g.filter(x => x.id !== id)) }
  function renameGroup(id: string) {
    if (!editName.trim()) { setEditingGroup(null); return }
    setGroups(g => g.map(x => x.id === id ? { ...x, name: editName.trim() } : x)); setEditingGroup(null)
  }
  function toggleCollapse(id: string) { setGroups(g => g.map(x => x.id === id ? { ...x, collapsed: !x.collapsed } : x)) }

  function addGroupTag(gid: string) {
    const name = (newTagInputs[gid] || '').trim()
    if (!name) return
    setGroups(g => g.map(x => x.id === gid ? { ...x, tags: [...(x.tags || []).filter(t => t.toLowerCase() !== name.toLowerCase()), name] } : x))
    setNewTagInputs(t => ({ ...t, [gid]: '' }))
  }
  function removeGroupTag(gid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, tags: (x.tags || []).filter(t => t !== tag), todos: x.todos.map(t => ({ ...t, tags: (t.tags || []).filter(tg => tg !== tag) })) } : x))
  }
  function toggleStagedTag(gid: string, tag: string) {
    setTodoTags(prev => { const cur = prev[gid] || []; return { ...prev, [gid]: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] } })
  }
  function addTodo(gid: string) {
    const text = (todoInputs[gid] || '').trim()
    if (!text) return
    const tags = todoTags[gid] || []
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: [...x.todos, { id: Date.now().toString(), text, done: false, tags: [...tags] }] } : x))
    setTodoInputs(t => ({ ...t, [gid]: '' })); setTodoTags(t => ({ ...t, [gid]: [] }))
  }
  function toggleTodo(gid: string, tid: string) {
    // Untagged item — simple done toggle
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => t.id === tid ? { ...t, done: !t.done } : t) } : x))
  }
  // Toggle completion of a specific tag (sub-task) on an item
  function toggleTagDone(gid: string, tid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => {
      if (t.id !== tid) return t
      const dt = t.doneTags || []
      return { ...t, doneTags: dt.includes(tag) ? dt.filter(x => x !== tag) : [...dt, tag] }
    }) } : x))
  }
  function toggleTagSection(gid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, collapsedTags: (x.collapsedTags || []).includes(tag) ? (x.collapsedTags || []).filter(t => t !== tag) : [...(x.collapsedTags || []), tag] } : x))
  }
  function removeTodo(gid: string, tid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => t.id !== tid) } : x))
  }
  function saveEditTodo(gid: string, tid: string) {
    if (!editTodoText.trim()) { setEditingTodo(null); return }
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => t.id === tid ? { ...t, text: editTodoText.trim() } : t) } : x))
    setEditingTodo(null)
  }
  function toggleTodoTag(gid: string, tid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => { const tags = t.tags || []; return t.id === tid ? { ...t, tags: tags.includes(tag) ? tags.filter(tg => tg !== tag) : [...tags, tag] } : t }) } : x))
  }
  function isFullyDone(t: Todo) {
    const tags = t.tags || []
    if (tags.length === 0) return t.done
    return tags.every(tg => (t.doneTags || []).includes(tg))
  }
  function clearDone(gid: string) { setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => !isFullyDone(t)) } : x)) }

  // Reorder: move dragged todo to just before the target todo, within the group's global order
  function handleDrop(gid: string, targetTid: string) {
    if (!drag || drag.gid !== gid || drag.tid === targetTid) { setDrag(null); setDragOver(null); return }
    setGroups(g => g.map(x => {
      if (x.id !== gid) return x
      const arr = [...x.todos]
      const from = arr.findIndex(t => t.id === drag.tid)
      const to = arr.findIndex(t => t.id === targetTid)
      if (from < 0 || to < 0) return x
      const [moved] = arr.splice(from, 1)
      const insertAt = arr.findIndex(t => t.id === targetTid)
      arr.splice(insertAt, 0, moved)
      return { ...x, todos: arr }
    }))
    setDrag(null); setDragOver(null)
  }

  // Count total sub-tasks and completed sub-tasks in a group.
  // Each tag on an item = 1 sub-task; untagged item = 1 task.
  function groupCounts(group: Group) {
    let total = 0, done = 0
    group.todos.forEach(t => {
      const tags = t.tags || []
      if (tags.length === 0) { total += 1; if (t.done) done += 1 }
      else { total += tags.length; done += (t.doneTags || []).filter(tg => tags.includes(tg)).length }
    })
    return { total, done }
  }

  const totalOpen = groups.reduce((a, g) => { const c = groupCounts(g); return a + (c.total - c.done) }, 0)

  function TodoRow({ group, t, sectionTag }: { group: Group; t: Todo; sectionTag?: string }) {
    const [showTags, setShowTags] = useState(false)
    const isEditing = editingTodo === t.id
    const isDragOver = dragOver === t.id
    // Completion depends on context: in a tag section, this row = that tag's sub-task
    const inTagSection = sectionTag && sectionTag !== UNTAGGED
    const checked = inTagSection ? (t.doneTags || []).includes(sectionTag!) : t.done
    const onToggle = () => inTagSection ? toggleTagDone(group.id, t.id, sectionTag!) : toggleTodo(group.id, t.id)
    // Other tags this item has (besides the current section) — shown as small context
    const otherTags = (t.tags || []).filter(tg => tg !== sectionTag)
    return (
      <div
        draggable={!isEditing}
        onDragStart={() => setDrag({ gid: group.id, tid: t.id })}
        onDragEnd={() => { setDrag(null); setDragOver(null) }}
        onDragOver={e => { if (drag && drag.gid === group.id) { e.preventDefault(); setDragOver(t.id) } }}
        onDrop={e => { e.preventDefault(); handleDrop(group.id, t.id) }}
        style={{
          background: checked ? '#0d160d' : '#161616', border: `1px solid ${isDragOver ? group.color : checked ? '#1a331a' : '#232323'}`,
          borderRadius: 8, padding: '10px 12px', transition: 'border-color 0.12s',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GripVertical size={14} color="#333" style={{ cursor: 'grab', flexShrink: 0 }} className="drag-handle" />
          <button onClick={onToggle} className={checked ? 'check-pop' : ''} style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${checked ? '#22C55E' : '#3a3a3a'}`, background: checked ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {checked && <Check size={12} color="#000" strokeWidth={3} />}
          </button>
          {isEditing ? (
            <input type="text" value={editTodoText} onChange={e => setEditTodoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEditTodo(group.id, t.id)} onBlur={() => saveEditTodo(group.id, t.id)} autoFocus style={{ flex: 1, fontSize: '0.84rem', padding: '3px 6px' }} />
          ) : (
            <button onClick={() => { setEditingTodo(t.id); setEditTodoText(t.text) }} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'text', padding: 0, fontSize: '0.84rem', color: checked ? '#4B5563' : '#F3F4F6', textDecoration: checked ? 'line-through' : 'none', lineHeight: 1.35 }}>{t.text}</button>
          )}
          <button onClick={() => setShowTags(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showTags ? group.color : '#3a3a3a', display: 'flex', padding: 2, flexShrink: 0 }}><Tag size={13} /></button>
          <button onClick={() => removeTodo(group.id, t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a3a', display: 'flex', padding: 2, flexShrink: 0 }}><X size={14} /></button>
        </div>
        {/* Context: other tags this item needs (with their done state) */}
        {inTagSection && otherTags.length > 0 && !showTags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7, paddingLeft: 39 }}>
            {otherTags.map(tag => {
              const tagDone = (t.doneTags || []).includes(tag)
              return <span key={tag} style={{ fontSize: '0.56rem', fontWeight: 600, background: tagDone ? '#16331620' : `${group.color}14`, color: tagDone ? '#22C55E' : '#6B7280', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.02em', textDecoration: tagDone ? 'line-through' : 'none' }}>{tag}</span>
            })}
          </div>
        )}
        {/* Flat/untagged view: show all tag chips */}
        {!inTagSection && (t.tags || []).length > 0 && !showTags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7, paddingLeft: 39 }}>
            {(t.tags || []).map(tag => <span key={tag} style={{ fontSize: '0.56rem', fontWeight: 600, background: `${group.color}1e`, color: group.color, borderRadius: 5, padding: '2px 7px' }}>{tag}</span>)}
          </div>
        )}
        {/* Tag editor */}
        {showTags && (group.tags || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, paddingLeft: 39 }}>
            {(group.tags || []).map(tag => {
              const on = (t.tags || []).includes(tag)
              return <button key={tag} onClick={() => toggleTodoTag(group.id, t.id, tag)} style={{ fontSize: '0.6rem', fontWeight: on ? 700 : 500, background: on ? group.color : 'transparent', color: on ? '#000' : '#9CA3AF', border: `1px solid ${on ? group.color : '#333'}`, borderRadius: 6, padding: '2px 9px', cursor: 'pointer' }}>{tag}</button>
            })}
          </div>
        )}
      </div>
    )
  }

  function TagSection({ group, tag, items }: { group: Group; tag: string; items: Todo[] }) {
    const collapsed = (group.collapsedTags || []).includes(tag)
    const isUntagged = tag === UNTAGGED
    // For a tag section, "done" = this tag checked; untagged uses item.done
    const doneCount = isUntagged ? items.filter(t => t.done).length : items.filter(t => (t.doneTags || []).includes(tag)).length
    const open = items.length - doneCount
    // Sort: incomplete first
    const sorted = [...items].sort((a, b) => {
      const ad = isUntagged ? a.done : (a.doneTags || []).includes(tag)
      const bd = isUntagged ? b.done : (b.doneTags || []).includes(tag)
      return Number(ad) - Number(bd)
    })
    return (
      <div>
        <button onClick={() => toggleTagSection(group.id, tag)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, marginBottom: collapsed ? 0 : 8, paddingLeft: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
          {collapsed ? <ChevronRight size={13} color={isUntagged ? '#6B7280' : group.color} /> : <ChevronDown size={13} color={isUntagged ? '#6B7280' : group.color} />}
          <div style={{ width: 7, height: 7, borderRadius: 2, background: isUntagged ? '#4B5563' : group.color, transform: 'rotate(45deg)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isUntagged ? '#6B7280' : group.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{isUntagged ? 'Untagged' : tag}</span>
          <div style={{ flex: 1, height: 1, background: '#1c1c1c' }} />
          <span style={{ fontSize: '0.62rem', color: doneCount === items.length ? '#22C55E' : '#4B5563', fontWeight: 700 }}>{doneCount}/{items.length}</span>
        </button>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map(t => <TodoRow key={t.id} group={group} t={t} sectionTag={tag} />)}
          </div>
        )}
      </div>
    )
  }

  function renderGrouped(group: Group) {
    if (group.todos.length === 0) return <div style={{ fontSize: '0.74rem', color: '#374151', padding: '8px 0', textAlign: 'center' }}>Nothing here yet — add an item below.</div>
    const tags = group.tags || []
    if (tags.length === 0) {
      const sorted = [...group.todos].sort((a, b) => Number(a.done) - Number(b.done))
      return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{sorted.map(t => <TodoRow key={t.id} group={group} t={t} />)}</div>
    }
    const sections: { tag: string; items: Todo[] }[] = []
    tags.forEach(tag => { const items = group.todos.filter(t => (t.tags || []).includes(tag)); if (items.length) sections.push({ tag, items }) })
    const untagged = group.todos.filter(t => (t.tags || []).length === 0)
    if (untagged.length) sections.push({ tag: UNTAGGED, items: untagged })
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{sections.map(s => <TagSection key={s.tag} group={group} tag={s.tag} items={s.items} />)}</div>
  }

  return (
    <PageShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 9 }}>
            <ListTodo size={23} style={{ color: 'var(--accent)' }} /> To-Do
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 3 }}>{totalOpen} open across {groups.length} list{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setAddingGroup(a => !a)} className="glow-orange" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
          <Plus size={16} /> List
        </button>
      </div>

      {addingGroup && (
        <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 6 }}>
          <input type="text" placeholder="List name (e.g. CIRE, Web Clients)" value={newGroup} onChange={e => setNewGroup(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()} autoFocus style={{ flex: 1 }} />
          <button onClick={addGroup} className="btn-amber" style={{ padding: '0 16px' }}>Add</button>
        </div>
      )}

      {groups.length === 0 && !addingGroup && (
        <div className="card" style={{ textAlign: 'center', padding: '44px 20px' }}>
          <ListTodo size={34} color="#374151" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontSize: '0.88rem', color: '#9CA3AF', marginBottom: 5 }}>No lists yet</p>
          <p style={{ fontSize: '0.74rem', color: '#4B5563' }}>Create a list for undated work — property tasks, clients, ideas.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(gRaw => {
          const group = norm(gRaw)
          const counts = groupCounts(group)
          const total = counts.total
          const doneCount = counts.done
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
          const staged = todoTags[group.id] || []
          return (
            <div key={group.id} className="card" style={{ borderLeft: `3px solid ${group.color}`, padding: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button onClick={() => toggleCollapse(group.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 0 }}>
                  {group.collapsed ? <ChevronRight size={17} /> : <ChevronDown size={17} />}
                </button>
                {editingGroup === group.id ? (
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && renameGroup(group.id)} onBlur={() => renameGroup(group.id)} autoFocus style={{ flex: 1, fontSize: '1rem', padding: '4px 8px' }} />
                ) : (
                  <button onClick={() => { setEditingGroup(group.id); setEditName(group.name) }} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
                    <span style={{ fontSize: '1.02rem', fontWeight: 800, color: group.color, letterSpacing: '0.01em' }}>{group.name}</span>
                    <Pencil size={12} color="#333" />
                  </button>
                )}
                <button onClick={() => setManagingTags(managingTags === group.id ? null : group.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: managingTags === group.id ? `${group.color}20` : 'transparent', border: `1px solid ${managingTags === group.id ? group.color : '#2a2a2a'}`, borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: managingTags === group.id ? group.color : '#9CA3AF', fontSize: '0.66rem', fontWeight: 600 }}>
                  <Tag size={11} /> {group.tags.length || 'Tags'}
                </button>
                <button onClick={() => removeGroup(group.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', display: 'flex' }}><X size={16} /></button>
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div style={{ marginBottom: group.collapsed ? 0 : 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.66rem', color: '#6B7280', fontWeight: 600 }}>{doneCount} of {total} done</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: pct === 100 ? '#22C55E' : group.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: '#161616', borderRadius: 4, overflow: 'hidden', border: '1px solid #1f1f1f' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22C55E' : `linear-gradient(90deg, ${group.color}, ${group.color}cc)`, borderRadius: 4, transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)', boxShadow: pct > 0 ? `0 0 10px ${pct === 100 ? '#22C55E' : group.color}70` : 'none' }} />
                  </div>
                </div>
              )}

              {!group.collapsed && (
                <>
                  {/* Manage tags panel */}
                  {managingTags === group.id && (
                    <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                      <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 9 }}>Tags for this list · used as sub-categories</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {group.tags.length === 0 && <span style={{ fontSize: '0.66rem', color: '#374151' }}>No tags yet.</span>}
                        {group.tags.map(tag => (
                          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', fontWeight: 600, background: `${group.color}1e`, color: group.color, borderRadius: 7, padding: '4px 10px' }}>
                            {tag}<button onClick={() => removeGroupTag(group.id, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: group.color, display: 'flex', padding: 0, opacity: 0.65 }}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="text" placeholder="New tag (OM, SM, Mailchimp…)" value={newTagInputs[group.id] || ''} onChange={e => setNewTagInputs(prev => ({ ...prev, [group.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGroupTag(group.id)} style={{ flex: 1, fontSize: '0.74rem', padding: '7px 10px' }} />
                        <button onClick={() => addGroupTag(group.id)} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '0 14px' }}>Add</button>
                      </div>
                    </div>
                  )}

                  {/* Items (always grouped by tag) */}
                  <div style={{ marginBottom: 14 }}>{renderGrouped(group)}</div>

                  {/* Add item */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" placeholder="Add item…" value={todoInputs[group.id] || ''} onChange={e => setTodoInputs(prev => ({ ...prev, [group.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTodo(group.id)} style={{ flex: 1, fontSize: '0.82rem', padding: '9px 11px' }} />
                    <button onClick={() => addTodo(group.id)} style={{ background: group.color, color: '#000', border: 'none', borderRadius: 7, padding: '0 15px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>+</button>
                  </div>
                  {group.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.58rem', color: '#4B5563', marginRight: 2 }}>Tag:</span>
                      {group.tags.map(tag => {
                        const on = staged.includes(tag)
                        return <button key={tag} onClick={() => toggleStagedTag(group.id, tag)} style={{ fontSize: '0.6rem', fontWeight: on ? 700 : 500, background: on ? group.color : 'transparent', color: on ? '#000' : '#6B7280', border: `1px solid ${on ? group.color : '#2e2e2e'}`, borderRadius: 6, padding: '2px 9px', cursor: 'pointer' }}>{tag}</button>
                      })}
                    </div>
                  )}

                  {group.todos.filter(isFullyDone).length > 0 && (
                    <button onClick={() => clearDone(group.id)} style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '0.66rem', padding: 0 }}>Clear {group.todos.filter(isFullyDone).length} completed</button>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
