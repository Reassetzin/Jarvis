'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { Check } from 'lucide-react'

interface Task { id: string; text: string; date: string; done: boolean; priority: boolean; category: string }
const CAT_COLORS: Record<string, string> = { Personal: '#3B82F6', Work: 'var(--accent)', Brand: '#8B5CF6', Health: '#22C55E', Finance: '#EF4444', Activity: '#EC4899' }

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export default function TodayPlanner() {
  const [tasks, setTasks] = usePersistentStore<Task[]>('planner_tasks', [])
  const today = ymd(new Date())
  const todayTasks = tasks.filter(t => t.date === today)
  const done = todayTasks.filter(t => t.done).length

  function toggle(id: string) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)) }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Today's Plan</div>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{done}/{todayTasks.length}</span>
      </div>
      {todayTasks.length === 0 ? (
        <div style={{ fontSize: '0.76rem', color: '#374151', textAlign: 'center', padding: '16px 0' }}>Nothing scheduled today.<br />Head to the Planner tab to add tasks.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {todayTasks.sort((a, b) => Number(b.priority) - Number(a.priority)).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.done ? '#0d1a0d' : '#181818', border: `1px solid ${t.done ? '#15391590' : '#222'}`, borderRadius: 4, padding: '8px 10px' }}>
              <button onClick={() => toggle(t.id)} style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${t.done ? '#22C55E' : '#374151'}`, background: t.done ? '#22C55E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.done && <Check size={10} color="#000" strokeWidth={3} />}
              </button>
              {t.priority && <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>⚡</span>}
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: CAT_COLORS[t.category] || '#6B7280', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.78rem', color: t.done ? '#4B5563' : '#E5E7EB', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
