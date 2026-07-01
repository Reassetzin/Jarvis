'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, Plus, Check, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react'
import PageShell from '@/components/ui/PageShell'

interface Task {
  id: string
  text: string
  date: string        // YYYY-MM-DD
  done: boolean
  priority: boolean
  category: string
}

interface Event {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  time: string        // HH:MM or '' for all-day
  type: string
  notes?: string
}

const CATEGORIES = ['Personal', 'Work', 'Brand', 'Health', 'Finance', 'Activity']
const CAT_COLORS: Record<string, string> = {
  Personal: '#3B82F6', Work: 'var(--accent)', Brand: '#8B5CF6', Health: '#22C55E', Finance: '#EF4444', Activity: '#EC4899',
}

const EVENT_TYPES = ['Appointment', 'Meeting', 'Birthday', 'Reminder', 'Social', 'Travel', 'Other']
const EVENT_META: Record<string, { color: string; emoji: string }> = {
  Appointment: { color: '#EF4444', emoji: '🩺' },
  Meeting: { color: '#3B82F6', emoji: '👥' },
  Birthday: { color: '#EC4899', emoji: '🎂' },
  Reminder: { color: 'var(--accent)', emoji: '⏰' },
  Social: { color: '#8B5CF6', emoji: '🎉' },
  Travel: { color: '#22C55E', emoji: '✈️' },
  Other: { color: '#6B7280', emoji: '📌' },
}

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function parseYmd(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function PlannerTab() {
  const [tasks, setTasks] = usePersistentStore<Task[]>('planner_tasks', [])
  const [events, setEvents] = usePersistentStore<Event[]>('planner_events', [])
  const [brands] = usePersistentStore<{ id: string; name: string; ideas: { id: string; text: string; status: string; date?: string; platform?: string }[] }[]>('brands', [])
  const [showContent, setShowContent] = useState(true)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(ymd(new Date()))
  const [input, setInput] = useState('')
  const [cat, setCat] = useState('Personal')
  const [priority, setPriority] = useState(false)
  const [addMode, setAddMode] = useState<'task' | 'event'>('task')
  const [evTitle, setEvTitle] = useState('')
  const [evTime, setEvTime] = useState('')
  const [evType, setEvType] = useState('Appointment')
  const [editingEvent, setEditingEvent] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', time: '', type: 'Appointment' })
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [taskEdit, setTaskEdit] = useState({ text: '', category: 'Personal', priority: false })
  const [dragItem, setDragItem] = useState<{ kind: 'task' | 'event'; id: string } | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)

  function rescheduleTo(dateStr: string) {
    if (!dragItem) return
    if (dragItem.kind === 'task') setTasks(ts => ts.map(t => t.id === dragItem.id ? { ...t, date: dateStr } : t))
    else setEvents(es => es.map(e => e.id === dragItem.id ? { ...e, date: dateStr } : e))
    setDragItem(null); setDragOverDate(null)
  }

  const todayStr = ymd(new Date())

  function tasksFor(dateStr: string) { return tasks.filter(t => t.date === dateStr) }
  function eventsFor(dateStr: string) {
    return events.filter(e => e.date === dateStr).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  }

  // Brand content scheduled for a given date
  function contentFor(dateStr: string) {
    if (!showContent) return []
    const items: { id: string; text: string; brand: string; platform?: string; status: string }[] = []
    brands.forEach(b => (b.ideas || []).forEach(idea => {
      if (idea.date === dateStr) items.push({ id: idea.id, text: idea.text, brand: b.name, platform: idea.platform, status: idea.status })
    }))
    return items
  }
  function addTask() {
    if (!input.trim()) return
    setTasks(t => [...t, { id: Date.now().toString(), text: input.trim(), date: selectedDate, done: false, priority, category: cat }])
    setInput(''); setPriority(false)
  }
  function addEvent() {
    if (!evTitle.trim()) return
    setEvents(e => [...e, { id: Date.now().toString(), title: evTitle.trim(), date: selectedDate, time: evTime, type: evType }])
    setEvTitle(''); setEvTime('')
  }
  function removeEvent(id: string) { setEvents(e => e.filter(x => x.id !== id)) }
  function startEditEvent(ev: Event) { setEditingEvent(ev.id); setEditForm({ title: ev.title, time: ev.time, type: ev.type }) }
  function saveEditEvent() {
    if (!editForm.title.trim()) return
    setEvents(es => es.map(x => x.id === editingEvent ? { ...x, title: editForm.title.trim(), time: editForm.time, type: editForm.type } : x))
    setEditingEvent(null)
  }
  function toggle(id: string) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)) }
  function remove(id: string) { setTasks(t => t.filter(x => x.id !== id)) }
  function startEditTask(t: Task) { setEditingTask(t.id); setTaskEdit({ text: t.text, category: t.category, priority: t.priority }) }
  function saveEditTask() {
    if (!taskEdit.text.trim()) return
    setTasks(ts => ts.map(x => x.id === editingTask ? { ...x, text: taskEdit.text.trim(), category: taskEdit.category, priority: taskEdit.priority } : x))
    setEditingTask(null)
  }

  // Month grid
  function monthGrid() {
    const year = cursor.getFullYear(), month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const startDay = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  // Week
  function weekDays() {
    const start = new Date(cursor); start.setDate(cursor.getDate() - cursor.getDay())
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  }

  function navigate(dir: number) {
    const c = new Date(cursor)
    if (view === 'month') c.setMonth(c.getMonth() + dir)
    else if (view === 'week') c.setDate(c.getDate() + dir * 7)
    else c.setDate(c.getDate() + dir)
    setCursor(c)
    if (view === 'day') setSelectedDate(ymd(c))
  }

  const selectedTasks = tasksFor(selectedDate)
  const selectedContent = contentFor(selectedDate)
  const selectedEvents = eventsFor(selectedDate)
  const selDateObj = parseYmd(selectedDate)

  return (
    <PageShell>
      {/* Header / nav */}
      <div className="card planner-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <CalIcon size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {(['month', 'week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? '#1a0a00' : 'transparent',
                border: `1px solid ${view === v ? 'var(--accent-dim)' : '#333'}`,
                borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
                color: view === v ? 'var(--accent)' : '#9CA3AF', fontWeight: view === v ? 700 : 500, fontSize: '0.78rem', textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowContent(s => !s)} className="btn-ghost" style={{ fontSize: '0.72rem', marginLeft: 'auto', color: showContent ? '#EC4899' : '#6B7280', borderColor: showContent ? 'rgba(236,72,153,0.4)' : undefined }}>🎬 Content</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#181818', border: '1px solid #333', borderRadius: 4, padding: 6, cursor: 'pointer', color: '#9CA3AF', display: 'flex', flexShrink: 0 }}><ChevronLeft size={15} /></button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, flex: 1, textAlign: 'center' }}>
            {view === 'month' && `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
            {view === 'week' && `Week of ${weekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {view === 'day' && cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <button onClick={() => navigate(1)} style={{ background: '#181818', border: '1px solid #333', borderRadius: 4, padding: 6, cursor: 'pointer', color: '#9CA3AF', display: 'flex', flexShrink: 0 }}><ChevronRight size={15} /></button>
          <button onClick={() => { setCursor(new Date()); setSelectedDate(todayStr) }} className="btn-ghost" style={{ fontSize: '0.72rem', flexShrink: 0 }}>Today</button>
        </div>
      </div>

      <div className="planner-split" style={{ display: 'grid', gridTemplateColumns: view === 'day' ? '1fr' : '2fr 1fr', gap: 16 }}>
        {/* Calendar */}
        {view !== 'day' && (
          <div className="card">
            {view === 'month' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
                  {DAYS.map(d => <div key={d} style={{ fontSize: '0.6rem', color: '#4B5563', textAlign: 'center', fontWeight: 600 }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {monthGrid().map((d, i) => {
                    if (!d) return <div key={i} />
                    const ds = ymd(d)
                    const dayTasks = tasksFor(ds)
                    const dayContent = contentFor(ds)
                    const dayEvents = eventsFor(ds)
                    const isToday = ds === todayStr
                    const isSelected = ds === selectedDate
                    return (
                      <button key={i} onClick={() => setSelectedDate(ds)} className="cal-cell"
                        onDragOver={(ev) => { if (dragItem) { ev.preventDefault(); setDragOverDate(ds) } }}
                        onDragLeave={() => { if (dragOverDate === ds) setDragOverDate(null) }}
                        onDrop={(ev) => { ev.preventDefault(); rescheduleTo(ds) }}
                        style={{
                        minHeight: 92, background: dragOverDate === ds ? '#2a1a00' : isSelected ? '#1a0a00' : isToday ? '#181818' : '#0c0c0c',
                        border: `1px solid ${dragOverDate === ds ? 'var(--accent)' : isSelected ? 'var(--accent-dim)' : isToday ? '#333' : '#1a1a1a'}`,
                        borderRadius: 4, cursor: 'pointer', padding: 5, display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left', overflow: 'hidden',
                      }}>
                        <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--accent)' : isSelected ? 'var(--accent)' : '#9CA3AF', fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</span>
                        {/* Mobile: colored dots */}
                        <div className="cal-dots" style={{ gap: 3, flexWrap: 'wrap' }}>
                          {dayEvents.slice(0, 3).map(e => <div key={e.id} style={{ width: 5, height: 5, borderRadius: '50%', background: EVENT_META[e.type]?.color || '#6B7280' }} />)}
                          {dayTasks.slice(0, 3).map(t => <div key={t.id} style={{ width: 5, height: 5, borderRadius: '50%', background: t.done ? '#333' : CAT_COLORS[t.category] }} />)}
                          {dayContent.slice(0, 1).map(c => <div key={c.id} style={{ width: 5, height: 5, borderRadius: '50%', background: '#EC4899' }} />)}
                        </div>
                        {/* Desktop: text pills */}
                        <div className="cal-pill-text" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dayEvents.slice(0, 2).map(e => (
                            <div key={e.id} style={{
                              fontSize: '0.58rem', lineHeight: 1.3, padding: '1px 4px', borderRadius: 3,
                              background: `${EVENT_META[e.type]?.color || '#6B7280'}22`, color: EVENT_META[e.type]?.color || '#9CA3AF',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              borderLeft: `2px solid ${EVENT_META[e.type]?.color || '#6B7280'}`, fontWeight: 600,
                            }}>{EVENT_META[e.type]?.emoji} {e.time && `${e.time} `}{e.title}</div>
                          ))}
                          {dayTasks.slice(0, 2).map(t => (
                            <div key={t.id} style={{
                              fontSize: '0.58rem', lineHeight: 1.3, padding: '1px 4px', borderRadius: 3,
                              background: t.done ? '#1a1a1a' : `${CAT_COLORS[t.category]}22`,
                              color: t.done ? '#4B5563' : CAT_COLORS[t.category],
                              textDecoration: t.done ? 'line-through' : 'none',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              borderLeft: `2px solid ${t.done ? '#333' : CAT_COLORS[t.category]}`,
                            }}>{t.text}</div>
                          ))}
                          {dayContent.slice(0, 2).map(c => (
                            <div key={c.id} style={{
                              fontSize: '0.58rem', lineHeight: 1.3, padding: '1px 4px', borderRadius: 3,
                              background: 'rgba(236,72,153,0.15)', color: '#EC4899',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              borderLeft: '2px solid #EC4899',
                            }}>🎬 {c.text}</div>
                          ))}
                          {(dayEvents.length + dayTasks.length + dayContent.length) > 4 && <span style={{ fontSize: '0.55rem', color: '#4B5563', paddingLeft: 4 }}>+{dayEvents.length + dayTasks.length + dayContent.length - 4} more</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            {view === 'week' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {weekDays().map(d => {
                  const ds = ymd(d)
                  const dayTasks = tasksFor(ds)
                  const isToday = ds === todayStr
                  const isSelected = ds === selectedDate
                  return (
                    <button key={ds} onClick={() => setSelectedDate(ds)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                      background: isSelected ? '#1a0a00' : '#181818',
                      border: `1px solid ${isSelected ? 'var(--accent-dim)' : '#222'}`,
                      borderRadius: 4, padding: '10px 12px', cursor: 'pointer',
                    }}>
                      <div style={{ minWidth: 44 }}>
                        <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>{DAYS[d.getDay()]}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isToday ? 'var(--accent)' : '#E5E7EB' }}>{d.getDate()}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayTasks.length === 0 ? <span style={{ fontSize: '0.7rem', color: '#374151' }}>No tasks</span> :
                          dayTasks.slice(0, 3).map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.done ? '#374151' : CAT_COLORS[t.category] }} />
                              <span style={{ fontSize: '0.72rem', color: t.done ? '#4B5563' : '#D1D5DB', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                            </div>
                          ))}
                        {dayTasks.length > 3 && <span style={{ fontSize: '0.62rem', color: '#4B5563' }}>+{dayTasks.length - 3} more</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Day tasks panel */}
        <div className="card">
          <div className="section-header">
            {view === 'day' ? 'Tasks' : selDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>

          {/* Add mode toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button onClick={() => setAddMode('task')} style={{ flex: 1, background: addMode === 'task' ? '#1a0a00' : 'transparent', border: `1px solid ${addMode === 'task' ? 'var(--accent-dim)' : '#333'}`, borderRadius: 6, padding: '6px', cursor: 'pointer', color: addMode === 'task' ? 'var(--accent)' : '#9CA3AF', fontSize: '0.72rem', fontWeight: addMode === 'task' ? 700 : 400 }}>✓ Task</button>
            <button onClick={() => setAddMode('event')} style={{ flex: 1, background: addMode === 'event' ? '#1a0a2a' : 'transparent', border: `1px solid ${addMode === 'event' ? '#6d28d9' : '#333'}`, borderRadius: 6, padding: '6px', cursor: 'pointer', color: addMode === 'event' ? '#a78bfa' : '#9CA3AF', fontSize: '0.72rem', fontWeight: addMode === 'event' ? 700 : 400 }}>📅 Event</button>
          </div>

          {addMode === 'task' ? (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <button onClick={() => setPriority(p => !p)} style={{ background: priority ? '#1a0a00' : 'transparent', border: `1px solid ${priority ? 'var(--accent)' : '#374151'}`, borderRadius: 4, padding: '8px 10px', cursor: 'pointer', flexShrink: 0, color: priority ? 'var(--accent)' : '#374151', fontWeight: 700 }}>⚡</button>
                <input type="text" placeholder="Add a task..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ flex: 1 }} />
                <button className="glow-orange" onClick={addTask} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ marginBottom: 12 }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </>
          ) : (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" placeholder="Event title (e.g. Dentist, Mom's birthday)" value={evTitle} onChange={e => setEvTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEvent()} />
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={evType} onChange={e => setEvType(e.target.value)} style={{ flex: 1 }}>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="time" value={evTime} onChange={e => setEvTime(e.target.value)} style={{ width: 110 }} title="Time (optional)" />
                <button onClick={addEvent} style={{ background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
            </div>
          )}

          {/* Events for this day */}
          {selectedEvents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {selectedEvents.map(e => (
                editingEvent === e.id ? (
                  <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#181818', border: '1px solid #6d28d9', borderRadius: 6, padding: 10 }}>
                    <input type="text" value={editForm.title} onChange={ev => setEditForm(f => ({ ...f, title: ev.target.value }))} onKeyDown={ev => ev.key === 'Enter' && saveEditEvent()} autoFocus />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select value={editForm.type} onChange={ev => setEditForm(f => ({ ...f, type: ev.target.value }))} style={{ flex: 1 }}>
                        {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <input type="time" value={editForm.time} onChange={ev => setEditForm(f => ({ ...f, time: ev.target.value }))} style={{ width: 110 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={saveEditEvent} style={{ flex: 1, background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 4, padding: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>Save</button>
                      <button onClick={() => setEditingEvent(null)} className="btn-ghost" style={{ flex: 1, fontSize: '0.75rem' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div key={e.id} draggable onDragStart={() => setDragItem({ kind: 'event', id: e.id })} onDragEnd={() => { setDragItem(null); setDragOverDate(null) }} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${EVENT_META[e.type]?.color || '#6B7280'}12`, border: `1px solid ${EVENT_META[e.type]?.color || '#6B7280'}40`, borderRadius: 6, padding: '9px 12px', cursor: 'grab' }}>
                    <span style={{ fontSize: '1rem' }}>{EVENT_META[e.type]?.emoji || '📌'}</span>
                    <button onClick={() => startEditEvent(e)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: '#F3F4F6', fontWeight: 600 }}>{e.title}</div>
                      <div style={{ fontSize: '0.6rem', color: EVENT_META[e.type]?.color || '#9CA3AF' }}>{e.type}{e.time && ` · ${e.time}`} · tap to edit</div>
                    </button>
                    <button onClick={() => removeEvent(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
                  </div>
                )
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedTasks.length === 0 && selectedEvents.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>Nothing planned. Add a task or event above.</div>}
            {[...selectedTasks].sort((a, b) => Number(b.priority) - Number(a.priority)).map(t => (
              editingTask === t.id ? (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#181818', border: '1px solid var(--accent-dim)', borderRadius: 4, padding: 10 }}>
                  <input type="text" value={taskEdit.text} onChange={e => setTaskEdit(f => ({ ...f, text: e.target.value }))} onKeyDown={e => e.key === 'Enter' && saveEditTask()} autoFocus />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setTaskEdit(f => ({ ...f, priority: !f.priority }))} style={{ background: taskEdit.priority ? '#1a0a00' : 'transparent', border: `1px solid ${taskEdit.priority ? 'var(--accent)' : '#374151'}`, borderRadius: 4, padding: '0 12px', cursor: 'pointer', color: taskEdit.priority ? 'var(--accent)' : '#374151', fontWeight: 700 }}>⚡</button>
                    <select value={taskEdit.category} onChange={e => setTaskEdit(f => ({ ...f, category: e.target.value }))} style={{ flex: 1 }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={saveEditTask} className="btn-amber" style={{ flex: 1, fontSize: '0.75rem', padding: '7px' }}>Save</button>
                    <button onClick={() => setEditingTask(null)} className="btn-ghost" style={{ flex: 1, fontSize: '0.75rem' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div key={t.id} draggable onDragStart={() => setDragItem({ kind: 'task', id: t.id })} onDragEnd={() => { setDragItem(null); setDragOverDate(null) }} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391590' : '#222'}`, borderRadius: 4, padding: '10px 12px', cursor: 'grab' }}>
                  <button onClick={() => toggle(t.id)} className={t.done ? 'check-pop' : ''} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {t.done && <Check size={11} color="#000" strokeWidth={3} />}
                  </button>
                  {t.priority && <span style={{ color: 'var(--accent)' }}>⚡</span>}
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[t.category], flexShrink: 0 }} />
                  <button onClick={() => startEditTask(t)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, fontSize: '0.82rem', color: t.done ? '#4B5563' : '#F3F4F6', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</button>
                  <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
                </div>
              )
            ))}
          </div>

          {selectedContent.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: '0.6rem', color: '#EC4899', fontWeight: 600, letterSpacing: '0.06em' }}>🎬 CONTENT SCHEDULED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedContent.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 4, padding: '9px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EC4899', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: '#F3F4F6' }}>{c.text}</div>
                      <div style={{ fontSize: '0.58rem', color: '#9CA3AF' }}>{c.brand}{c.platform && ` · ${c.platform}`} · {c.status}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.58rem', color: '#374151', marginTop: 8 }}>Edit content in the Brand tab. Set a target date on any idea to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
