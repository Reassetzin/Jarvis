'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Plus, X, Check, ChevronDown, ChevronRight, ListTodo, Pencil, Tag, LayoutList, Layers } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

interface Todo { id: string; text: string; done: boolean; tags: string[] }
interface Group { id: string; name: string; color: string; todos: Todo[]; tags?: string[]; collapsed?: boolean; grouped?: boolean }

const GROUP_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#F97316']
const UNTAGGED = '__untagged__'

export default function TodosTab() {
  const [groups, setGroups] = usePersistentStore<Group[]>('todo_groups', [])
  const [newGroup, setNewGroup] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [todoInputs, setTodoInputs] = useState<Record<string, string>>({})
  const [todoTags, setTodoTags] = useState<Record<string, string[]>>({})   // staged tags for the add-input per group
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({})
  const [managingTags, setManagingTags] = useState<string | null>(null)

  function addGroup() {
    if (!newGroup.trim()) return
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length]
    setGroups(g => [...g, { id: Date.now().toString(), name: newGroup.trim(), color, todos: [], tags: [], grouped: false }])
    setNewGroup(''); setAddingGroup(false)
  }
  function removeGroup(id: string) { setGroups(g => g.filter(x => x.id !== id)) }
  function renameGroup(id: string) {
    if (!editName.trim()) { setEditingGroup(null); return }
    setGroups(g => g.map(x => x.id === id ? { ...x, name: editName.trim() } : x))
    setEditingGroup(null)
  }
  function toggleCollapse(id: string) { setGroups(g => g.map(x => x.id === id ? { ...x, collapsed: !x.collapsed } : x)) }
  function toggleGrouped(id: string) { setGroups(g => g.map(x => x.id === id ? { ...x, grouped: !x.grouped } : x)) }

  function addGroupTag(gid: string) {
    const name = (newTagInputs[gid] || '').trim()
    if (!name) return
    setGroups(g => g.map(x => x.id === gid ? { ...x, tags: [...(x.tags || []).filter(t => t.toLowerCase() !== name.toLowerCase()), name] } : x))
    setNewTagInputs(t => ({ ...t, [gid]: '' }))
  }
  function removeGroupTag(gid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? {
      ...x, tags: (x.tags || []).filter(t => t !== tag),
      todos: x.todos.map(t => ({ ...t, tags: t.tags.filter(tg => tg !== tag) })),
    } : x))
  }

  // staged-tag helpers for the add box
  function toggleStagedTag(gid: string, tag: string) {
    setTodoTags(prev => {
      const cur = prev[gid] || []
      return { ...prev, [gid]: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] }
    })
  }
  function addTodo(gid: string) {
    const text = (todoInputs[gid] || '').trim()
    if (!text) return
    const tags = todoTags[gid] || []
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: [...x.todos, { id: Date.now().toString(), text, done: false, tags: [...tags] }] } : x))
    setTodoInputs(t => ({ ...t, [gid]: '' }))
    setTodoTags(t => ({ ...t, [gid]: [] }))
  }
  function toggleTodo(gid: string, tid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => t.id === tid ? { ...t, done: !t.done } : t) } : x))
  }
  function removeTodo(gid: string, tid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => t.id !== tid) } : x))
  }
  function toggleTodoTag(gid: string, tid: string, tag: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => { const tags = t.tags || []; return t.id === tid ? { ...t, tags: tags.includes(tag) ? tags.filter(tg => tg !== tag) : [...tags, tag] } : t }) } : x))
  }
  function clearDone(gid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => !t.done) } : x))
  }

  const totalOpen = groups.reduce((a, g) => a + g.todos.filter(t => !t.done).length, 0)

  function TodoRow({ group, t }: { group: Group; t: Todo }) {
    const [showTags, setShowTags] = useState(false)
    return (
      <div className="item-enter" style={{ background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391560' : '#222'}`, borderRadius: 6, padding: '9px 11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => toggleTodo(group.id, t.id)} className={t.done ? 'check-pop' : ''} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {t.done && <Check size={11} color="#000" strokeWidth={3} />}
          </button>
          <span style={{ flex: 1, fontSize: '0.82rem', color: t.done ? '#4B5563' : '#F3F4F6', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
          {(group.tags || []).length > 0 && (
            <button onClick={() => setShowTags(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.tags.length > 0 ? group.color : '#374151', display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}>
              <Tag size={12} />{t.tags.length > 0 && <span style={{ fontSize: '0.6rem' }}>{t.tags.length}</span>}
            </button>
          )}
          <button onClick={() => removeTodo(group.id, t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex' }}><X size={13} /></button>
        </div>
        {t.tags.length > 0 && !showTags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, paddingLeft: 28 }}>
            {t.tags.map(tag => <span key={tag} style={{ fontSize: '0.58rem', background: `${group.color}20`, color: group.color, borderRadius: 10, padding: '1px 7px' }}>{tag}</span>)}
          </div>
        )}
        {showTags && (group.tags || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, paddingLeft: 28 }}>
            {(group.tags || []).map(tag => {
              const on = t.tags.includes(tag)
              return (
                <button key={tag} onClick={() => toggleTodoTag(group.id, t.id, tag)} style={{ fontSize: '0.6rem', background: on ? group.color : 'transparent', color: on ? '#000' : '#9CA3AF', border: `1px solid ${on ? group.color : '#333'}`, borderRadius: 10, padding: '2px 9px', cursor: 'pointer', fontWeight: on ? 700 : 400 }}>{tag}</button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function renderTodos(group: Group) {
    // Ensure every todo has a tags array (migration-safe for old data)
    const safeTodos = group.todos.map(t => ({ ...t, tags: t.tags || [] }))
    const sorted = [...safeTodos].sort((a, b) => Number(a.done) - Number(b.done))
    if (group.todos.length === 0) return <div style={{ fontSize: '0.72rem', color: '#374151', padding: '4px 0' }}>Nothing here yet.</div>

    if (group.grouped && (group.tags || []).length > 0) {
      const sections: { tag: string; items: Todo[] }[] = []
      ;(group.tags || []).forEach(tag => {
        const items = sorted.filter(t => t.tags.includes(tag))
        if (items.length > 0) sections.push({ tag, items })
      })
      const untagged = sorted.filter(t => t.tags.length === 0)
      if (untagged.length > 0) sections.push({ tag: UNTAGGED, items: untagged })

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map(sec => (
            <div key={sec.tag}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: sec.tag === UNTAGGED ? '#4B5563' : group.color }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sec.tag === UNTAGGED ? '#6B7280' : group.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sec.tag === UNTAGGED ? 'Untagged' : sec.tag}</span>
                <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>{sec.items.filter(t => !t.done).length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 4 }}>
                {sec.items.map(t => <TodoRow key={t.id} group={group} t={t} />)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{sorted.map(t => <TodoRow key={t.id} group={group} t={t} />)}</div>
  }

  return (
    <PageShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ListTodo size={22} style={{ color: 'var(--accent)' }} /> To-Do
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 2 }}>{totalOpen} open item{totalOpen !== 1 ? 's' : ''} across {groups.length} list{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setAddingGroup(a => !a)} className="glow-orange" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
          <Plus size={15} /> List
        </button>
      </div>

      {addingGroup && (
        <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 6 }}>
          <input type="text" placeholder="List name (e.g. Properties, Web Clients)" value={newGroup} onChange={e => setNewGroup(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()} autoFocus style={{ flex: 1 }} />
          <button onClick={addGroup} className="btn-amber" style={{ padding: '0 16px' }}>Add</button>
        </div>
      )}

      {groups.length === 0 && !addingGroup && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ListTodo size={32} color="#374151" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>No lists yet</p>
          <p style={{ fontSize: '0.72rem', color: '#4B5563' }}>Create a list for things without a set date — property tasks, work items, ideas.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.map(group => {
          const open = group.todos.filter(t => !t.done).length
          const done = group.todos.filter(t => t.done).length
          const staged = todoTags[group.id] || []
          return (
            <div key={group.id} className="card" style={{ borderLeft: `3px solid ${group.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: group.collapsed ? 0 : 12 }}>
                <button onClick={() => toggleCollapse(group.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 0 }}>
                  {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
                {editingGroup === group.id ? (
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && renameGroup(group.id)} onBlur={() => renameGroup(group.id)} autoFocus style={{ flex: 1, fontSize: '0.9rem', padding: '4px 8px' }} />
                ) : (
                  <button onClick={() => { setEditingGroup(group.id); setEditName(group.name) }} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: group.color }}>{group.name}</span>
                    <Pencil size={11} color="#374151" />
                  </button>
                )}
                <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{open} open{done > 0 ? ` · ${done} done` : ''}</span>
                <button onClick={() => removeGroup(group.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex' }}><X size={15} /></button>
              </div>

              {!group.collapsed && (
                <>
                  {/* View toggle + manage tags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <button onClick={() => toggleGrouped(group.id)} disabled={(group.tags || []).length === 0} style={{ display: 'flex', alignItems: 'center', gap: 5, background: group.grouped ? `${group.color}20` : '#181818', border: `1px solid ${group.grouped ? group.color : '#333'}`, borderRadius: 6, padding: '5px 10px', cursor: (group.tags || []).length === 0 ? 'not-allowed' : 'pointer', color: group.grouped ? group.color : '#9CA3AF', fontSize: '0.68rem', fontWeight: 600, opacity: (group.tags || []).length === 0 ? 0.5 : 1 }}>
                      {group.grouped ? <Layers size={13} /> : <LayoutList size={13} />} {group.grouped ? 'Grouped' : 'Flat'}
                    </button>
                    <button onClick={() => setManagingTags(managingTags === group.id ? null : group.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: managingTags === group.id ? `${group.color}20` : '#181818', border: `1px solid ${managingTags === group.id ? group.color : '#333'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: managingTags === group.id ? group.color : '#9CA3AF', fontSize: '0.68rem', fontWeight: 600 }}>
                      <Tag size={12} /> Tags{(group.tags || []).length > 0 ? ` (${(group.tags || []).length})` : ''}
                    </button>
                  </div>

                  {/* Manage tags panel */}
                  {managingTags === group.id && (
                    <div style={{ background: '#181818', border: '1px solid #222', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 8 }}>Tags for this list (used as sub-categories)</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                        {(group.tags || []).length === 0 && <span style={{ fontSize: '0.66rem', color: '#374151' }}>No tags yet.</span>}
                        {(group.tags || []).map(tag => (
                          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', background: `${group.color}20`, color: group.color, borderRadius: 12, padding: '3px 9px' }}>
                            {tag}
                            <button onClick={() => removeGroupTag(group.id, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: group.color, display: 'flex', padding: 0, opacity: 0.7 }}><X size={11} /></button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="text" placeholder="New tag (e.g. 123 Main St, OM, Mailchimp)" value={newTagInputs[group.id] || ''} onChange={e => setNewTagInputs(prev => ({ ...prev, [group.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGroupTag(group.id)} style={{ flex: 1, fontSize: '0.72rem', padding: '6px 9px' }} />
                        <button onClick={() => addGroupTag(group.id)} className="btn-ghost" style={{ fontSize: '0.7rem', padding: '0 12px' }}>Add</button>
                      </div>
                    </div>
                  )}

                  {/* Todos */}
                  <div style={{ marginBottom: 10 }}>{renderTodos(group)}</div>

                  {/* Add item */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" placeholder="Add item..." value={todoInputs[group.id] || ''} onChange={e => setTodoInputs(prev => ({ ...prev, [group.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTodo(group.id)} style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px' }} />
                    <button onClick={() => addTodo(group.id)} style={{ background: group.color, color: '#000', border: 'none', borderRadius: 6, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                  {/* Stage tags for the new item */}
                  {(group.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {(group.tags || []).map(tag => {
                        const on = staged.includes(tag)
                        return <button key={tag} onClick={() => toggleStagedTag(group.id, tag)} style={{ fontSize: '0.6rem', background: on ? group.color : 'transparent', color: on ? '#000' : '#6B7280', border: `1px solid ${on ? group.color : '#333'}`, borderRadius: 10, padding: '2px 9px', cursor: 'pointer', fontWeight: on ? 700 : 400 }}>{tag}</button>
                      })}
                      {staged.length > 0 && <span style={{ fontSize: '0.58rem', color: '#4B5563', alignSelf: 'center' }}>← tags for new item</span>}
                    </div>
                  )}

                  {done > 0 && (
                    <button onClick={() => clearDone(group.id)} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '0.65rem', padding: 0 }}>Clear {done} completed</button>
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
