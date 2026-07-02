'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { Plus, X, Check, ChevronDown, ChevronRight, ListTodo, GripVertical, Pencil } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

interface Todo { id: string; text: string; done: boolean }
interface Group { id: string; name: string; color: string; todos: Todo[]; collapsed?: boolean }

const GROUP_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#F97316']

export default function TodosTab() {
  const [groups, setGroups] = usePersistentStore<Group[]>('todo_groups', [])
  const [newGroup, setNewGroup] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [todoInputs, setTodoInputs] = useState<Record<string, string>>({})
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function addGroup() {
    if (!newGroup.trim()) return
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length]
    setGroups(g => [...g, { id: Date.now().toString(), name: newGroup.trim(), color, todos: [] }])
    setNewGroup(''); setAddingGroup(false)
  }
  function removeGroup(id: string) { setGroups(g => g.filter(x => x.id !== id)) }
  function renameGroup(id: string) {
    if (!editName.trim()) { setEditingGroup(null); return }
    setGroups(g => g.map(x => x.id === id ? { ...x, name: editName.trim() } : x))
    setEditingGroup(null)
  }
  function toggleCollapse(id: string) { setGroups(g => g.map(x => x.id === id ? { ...x, collapsed: !x.collapsed } : x)) }
  function addTodo(gid: string) {
    const text = (todoInputs[gid] || '').trim()
    if (!text) return
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: [...x.todos, { id: Date.now().toString(), text, done: false }] } : x))
    setTodoInputs(t => ({ ...t, [gid]: '' }))
  }
  function toggleTodo(gid: string, tid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.map(t => t.id === tid ? { ...t, done: !t.done } : t) } : x))
  }
  function removeTodo(gid: string, tid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => t.id !== tid) } : x))
  }
  function clearDone(gid: string) {
    setGroups(g => g.map(x => x.id === gid ? { ...x, todos: x.todos.filter(t => !t.done) } : x))
  }

  const totalOpen = groups.reduce((a, g) => a + g.todos.filter(t => !t.done).length, 0)

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                    {group.todos.length === 0 && <div style={{ fontSize: '0.72rem', color: '#374151', padding: '4px 0' }}>Nothing here yet.</div>}
                    {[...group.todos].sort((a, b) => Number(a.done) - Number(b.done)).map(t => (
                      <div key={t.id} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391560' : '#222'}`, borderRadius: 6, padding: '9px 11px' }}>
                        <button onClick={() => toggleTodo(group.id, t.id)} className={t.done ? 'check-pop' : ''} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {t.done && <Check size={11} color="#000" strokeWidth={3} />}
                        </button>
                        <span style={{ flex: 1, fontSize: '0.82rem', color: t.done ? '#4B5563' : '#F3F4F6', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                        <button onClick={() => removeTodo(group.id, t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex' }}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" placeholder="Add item..." value={todoInputs[group.id] || ''} onChange={e => setTodoInputs(prev => ({ ...prev, [group.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTodo(group.id)} style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px' }} />
                    <button onClick={() => addTodo(group.id)} style={{ background: group.color, color: '#000', border: 'none', borderRadius: 6, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                  {done > 0 && (
                    <button onClick={() => clearDone(group.id)} style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '0.65rem', padding: 0 }}>Clear {done} completed</button>
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
