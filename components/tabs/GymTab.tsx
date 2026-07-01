'use client'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Plus, Activity } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import Heatmap from '@/components/ui/Heatmap'
import { markComplete } from '@/lib/streaks'

type ActivityType = 'Soccer' | 'Volleyball' | 'Pickleball' | 'Run' | 'Climbing' | 'Calisthenics' | 'Home Workout'

const ACTIVITY_META: Record<ActivityType, { color: string; emoji: string; metric: string }> = {
  Soccer: { color: '#22C55E', emoji: '⚽', metric: 'duration' },
  Volleyball: { color: '#F59E0B', emoji: '🏐', metric: 'duration' },
  Pickleball: { color: '#EAB308', emoji: '🎾', metric: 'duration' },
  Run: { color: '#EF4444', emoji: '🏃', metric: 'distance' },
  Climbing: { color: '#8B5CF6', emoji: '🧗', metric: 'grade' },
  Calisthenics: { color: '#3B82F6', emoji: '💪', metric: 'sets' },
  'Home Workout': { color: '#EC4899', emoji: '🏠', metric: 'sets' },
}

interface ExSet { reps: number; note: string }
interface Session {
  id: string; type: ActivityType; date: string
  duration?: number; distance?: number; grade?: string
  exercises?: { name: string; sets: ExSet[] }[]
  notes: string
}

export default function GymTab() {
  const [todayType, setTodayType] = useState<ActivityType>('Soccer')
  const [history, setHistory] = usePersistentStore<Session[]>('activity_history', [])
  const [weeklyGoal, setWeeklyGoal] = usePersistentStore('activity_weekly_goal', 4)

  // Active session builder
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [grade, setGrade] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<{ name: string; sets: ExSet[] }[]>([])
  const [exInput, setExInput] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const meta = ACTIVITY_META[todayType]
  const isStrength = meta.metric === 'sets'

  function addExercise() {
    if (!exInput.trim()) return
    setExercises(e => [...e, { name: exInput.trim(), sets: [{ reps: 0, note: '' }] }])
    setExInput(''); setExpanded(exercises.length)
  }
  function addSet(i: number) { setExercises(e => e.map((ex, j) => j === i ? { ...ex, sets: [...ex.sets, { reps: 0, note: '' }] } : ex)) }
  function updateSet(i: number, si: number, reps: number) { setExercises(e => e.map((ex, j) => j === i ? { ...ex, sets: ex.sets.map((s, k) => k === si ? { ...s, reps } : s) } : ex)) }

  function saveSession() {
    const session: Session = {
      id: Date.now().toString(), type: todayType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes,
    }
    if (meta.metric === 'duration') session.duration = parseInt(duration) || 0
    if (meta.metric === 'distance') session.distance = parseFloat(distance) || 0
    if (meta.metric === 'grade') session.grade = grade
    if (isStrength) session.exercises = exercises
    setHistory(h => [session, ...h.slice(0, 49)])
    markComplete('activity')
    setDuration(''); setDistance(''); setGrade(''); setNotes(''); setExercises([])
    alert('Session logged!')
  }

  // This week's count
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const thisWeek = history.filter(s => {
    const d = new Date(s.date + ', ' + now.getFullYear())
    return d >= weekStart
  }).length

  const activityHeatmap: Record<string, number> = {}
  history.forEach(s => {
    const d = new Date(s.date)
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      activityHeatmap[key] = (activityHeatmap[key] || 0) + 1
    }
  })

  return (
    <PageShell>
      {/* Weekly goal banner */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Activity size={20} color="#F59E0B" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>This week</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: thisWeek >= weeklyGoal ? '#22C55E' : '#F59E0B' }}>
            {thisWeek} / {weeklyGoal} sessions
          </div>
        </div>
        <div style={{ flex: 2, minWidth: 120 }}>
          <div style={{ height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (thisWeek / weeklyGoal) * 100)}%`, background: thisWeek >= weeklyGoal ? '#22C55E' : '#F59E0B', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Goal/wk </span>
          <input type="number" value={weeklyGoal} onChange={e => setWeeklyGoal(Number(e.target.value))} style={{ width: 50, display: 'inline-block' }} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <Heatmap data={activityHeatmap} color="#EC4899" title="Training Days · Last 17 Weeks" weeks={17} />
      </div>

      <DesktopGrid columns={2}>
        {/* Log a session */}
        <div className="card">
          <div className="section-header">Log a Session</div>

          {/* Activity type picker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6, marginBottom: 14 }}>
            {(Object.keys(ACTIVITY_META) as ActivityType[]).map(t => {
              const m = ACTIVITY_META[t]
              const active = todayType === t
              return (
                <button key={t} onClick={() => setTodayType(t)} style={{
                  background: active ? `${m.color}18` : '#181818',
                  border: `1px solid ${active ? m.color + '70' : '#222'}`,
                  borderRadius: 6, padding: '8px 4px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.62rem', color: active ? m.color : '#9CA3AF', fontWeight: active ? 700 : 500 }}>{t}</span>
                </button>
              )
            })}
          </div>

          {/* Metric-specific input */}
          {meta.metric === 'duration' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Duration (minutes)</div>
              <input type="number" placeholder="e.g. 90" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          )}
          {meta.metric === 'distance' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Distance (km)</div>
              <input type="number" step="0.1" placeholder="e.g. 5.2" value={distance} onChange={e => setDistance(e.target.value)} />
            </div>
          )}
          {meta.metric === 'grade' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 4 }}>Hardest grade sent (e.g. V4, 5.11a)</div>
              <input type="text" placeholder="e.g. V4" value={grade} onChange={e => setGrade(e.target.value)} />
            </div>
          )}

          {/* Strength exercises */}
          {isStrength && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: 6 }}>Exercises</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                {exercises.map((ex, i) => (
                  <div key={i} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4 }}>
                    <div onClick={() => setExpanded(x => x === i ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer' }}>
                      <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600 }}>{ex.name}</span>
                      <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>{ex.sets.length} sets · {ex.sets.reduce((a, s) => a + s.reps, 0)} reps</span>
                      {expanded === i ? <ChevronUp size={13} color="#6B7280" /> : <ChevronDown size={13} color="#6B7280" />}
                      <button onClick={e => { e.stopPropagation(); setExercises(es => es.filter((_, j) => j !== i)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={12} /></button>
                    </div>
                    {expanded === i && (
                      <div style={{ padding: '0 12px 12px' }}>
                        {ex.sets.map((s, si) => (
                          <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.65rem', color: '#4B5563', width: 30 }}>Set {si + 1}</span>
                            <input type="number" placeholder="reps" value={s.reps || ''} onChange={e => updateSet(i, si, parseInt(e.target.value) || 0)} style={{ flex: 1 }} />
                          </div>
                        ))}
                        <button onClick={() => addSet(i)} className="btn-ghost" style={{ fontSize: '0.7rem', marginTop: 2 }}><Plus size={10} style={{ display: 'inline' }} /> Set</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="text" placeholder="e.g. Pull-ups" value={exInput} onChange={e => setExInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExercise()} style={{ flex: 1 }} />
                <button className="glow-orange" onClick={addExercise} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>
            </div>
          )}

          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="How'd it go? Notes..." style={{ marginBottom: 8, resize: 'none' }} />
          <button onClick={saveSession} className="btn-amber">Log {todayType} Session</button>
        </div>

        {/* History */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Activity History</div>
            {history.length > 8 && <button onClick={() => setShowAll(s => !s)} className="btn-ghost" style={{ fontSize: '0.7rem' }}>{showAll ? 'Less' : 'All'}</button>}
          </div>
          {history.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No sessions logged yet.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(showAll ? history : history.slice(0, 8)).map(s => {
              const m = ACTIVITY_META[s.type]
              const summary = s.duration ? `${s.duration} min` : s.distance ? `${s.distance} km` : s.grade ? `Top: ${s.grade}` : s.exercises ? `${s.exercises.length} exercises` : ''
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#181818', border: '1px solid #222', borderRadius: 4, padding: '10px 12px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: m.color }}>{s.type}</div>
                    <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>{s.date}{summary && ` · ${summary}`}</div>
                  </div>
                  <button onClick={() => setHistory(h => h.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
                </div>
              )
            })}
          </div>
        </div>
      </DesktopGrid>
    </PageShell>
  )
}
