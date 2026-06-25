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

const CATEGORIES = ['Personal', 'Work', 'Brand', 'Health', 'Finance', 'Activity']
const CAT_COLORS: Record<string, string> = {
  Personal: '#3B82F6', Work: '#F59E0B', Brand: '#8B5CF6', Health: '#22C55E', Finance: '#EF4444', Activity: '#EC4899',
}

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function parseYmd(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function PlannerTab() {
  const [tasks, setTasks] = usePersistentStore<Task[]>('planner_tasks', [])
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(ymd(new Date()))
  const [input, setInput] = useState('')
  const [cat, setCat] = useState('Personal')
  const [priority, setPriority] = useState(false)

  const todayStr = ymd(new Date())

  function tasksFor(dateStr: string) { return tasks.filter(t => t.date === dateStr) }
  function addTask() {
    if (!input.trim()) return
    setTasks(t => [...t, { id: Date.now().toString(), text: input.trim(), date: selectedDate, done: false, priority, category: cat }])
    setInput(''); setPriority(false)
  }
  function toggle(id: string) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)) }
  function remove(id: string) { setTasks(t => t.filter(x => x.id !== id)) }

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
  const selDateObj = parseYmd(selectedDate)

  return (
    <PageShell>
      {/* Header / nav */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <CalIcon size={18} color="#F59E0B" />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['month', 'week', 'day'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? '#1a0a00' : 'transparent',
              border: `1px solid ${view === v ? '#92400E' : '#333'}`,
              borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
              color: view === v ? '#F59E0B' : '#9CA3AF', fontWeight: view === v ? 700 : 500, fontSize: '0.78rem', textTransform: 'capitalize',
            }}>{v}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#181818', border: '1px solid #333', borderRadius: 4, padding: 6, cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><ChevronLeft size={15} /></button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
            {view === 'month' && `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
            {view === 'week' && `Week of ${weekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {view === 'day' && cursor.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <button onClick={() => navigate(1)} style={{ background: '#181818', border: '1px solid #333', borderRadius: 4, padding: 6, cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><ChevronRight size={15} /></button>
          <button onClick={() => { setCursor(new Date()); setSelectedDate(todayStr) }} className="btn-ghost" style={{ fontSize: '0.72rem' }}>Today</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: view === 'day' ? '1fr' : '2fr 1fr', gap: 16 }}>
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
                    const isToday = ds === todayStr
                    const isSelected = ds === selectedDate
                    return (
                      <button key={i} onClick={() => setSelectedDate(ds)} style={{
                        minHeight: 92, background: isSelected ? '#1a0a00' : isToday ? '#181818' : '#0c0c0c',
                        border: `1px solid ${isSelected ? '#92400E' : isToday ? '#333' : '#1a1a1a'}`,
                        borderRadius: 4, cursor: 'pointer', padding: 5, display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left', overflow: 'hidden',
                      }}>
                        <span style={{ fontSize: '0.7rem', color: isToday ? '#F59E0B' : isSelected ? '#F59E0B' : '#9CA3AF', fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {dayTasks.slice(0, 3).map(t => (
                            <div key={t.id} style={{
                              fontSize: '0.58rem', lineHeight: 1.3, padding: '1px 4px', borderRadius: 3,
                              background: t.done ? '#1a1a1a' : `${CAT_COLORS[t.category]}22`,
                              color: t.done ? '#4B5563' : CAT_COLORS[t.category],
                              textDecoration: t.done ? 'line-through' : 'none',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              borderLeft: `2px solid ${t.done ? '#333' : CAT_COLORS[t.category]}`,
                            }}>{t.text}</div>
                          ))}
                          {dayTasks.length > 3 && <span style={{ fontSize: '0.55rem', color: '#4B5563', paddingLeft: 4 }}>+{dayTasks.length - 3} more</span>}
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
                      border: `1px solid ${isSelected ? '#92400E' : '#222'}`,
                      borderRadius: 4, padding: '10px 12px', cursor: 'pointer',
                    }}>
                      <div style={{ minWidth: 44 }}>
                        <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>{DAYS[d.getDay()]}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isToday ? '#F59E0B' : '#E5E7EB' }}>{d.getDate()}</div>
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

          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <button onClick={() => setPriority(p => !p)} style={{ background: priority ? '#1a0a00' : 'transparent', border: `1px solid ${priority ? '#F59E0B' : '#374151'}`, borderRadius: 4, padding: '8px 10px', cursor: 'pointer', flexShrink: 0, color: priority ? '#F59E0B' : '#374151', fontWeight: 700 }}>⚡</button>
            <input type="text" placeholder="Add a task..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ flex: 1 }} />
            <button className="glow-orange" onClick={addTask} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ marginBottom: 12 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedTasks.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>Nothing planned. Add a task above.</div>}
            {[...selectedTasks].sort((a, b) => Number(b.priority) - Number(a.priority)).map(t => (
              <div key={t.id} className="item-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391590' : '#222'}`, borderRadius: 4, padding: '10px 12px' }}>
                <button onClick={() => toggle(t.id)} className={t.done ? 'check-pop' : ''} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.done && <Check size={11} color="#000" strokeWidth={3} />}
                </button>
                {t.priority && <span style={{ color: '#F59E0B' }}>⚡</span>}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[t.category], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.82rem', color: t.done ? '#4B5563' : '#F3F4F6', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
