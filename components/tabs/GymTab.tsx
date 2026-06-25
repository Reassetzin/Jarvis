'use client'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'

interface ExerciseSet { reps: number; weight: number }
interface Exercise { id: string; name: string; sets: ExerciseSet[]; notes: string }
interface WorkoutLog { id: string; date: string; exercises: Exercise[]; notes: string }
const DAY_SPLITS = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Full Body']

export default function GymTab() {
  const [exercises, setExercises] = useDailyStore<Exercise[]>('gym_exercises', [])
  const [workoutNotes, setWorkoutNotes] = useDailyStore('gym_notes', '')
  const [history, setHistory] = usePersistentStore<WorkoutLog[]>('gym_history', [])
  const [split, setSplit] = usePersistentStore('gym_split', 'Push')
  const [exInput, setExInput] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  function addExercise() {
    if (!exInput.trim()) return
    const ex: Exercise = { id: Date.now().toString(), name: exInput.trim(), sets: [{ reps: 0, weight: 0 }], notes: '' }
    setExercises(es => [...es, ex]); setExInput(''); setExpanded(ex.id)
  }
  function addSet(exId: string) { setExercises(es => es.map(e => e.id === exId ? { ...e, sets: [...e.sets, { reps: 0, weight: 0 }] } : e)) }
  function updateSet(exId: string, si: number, field: 'reps' | 'weight', val: number) { setExercises(es => es.map(e => e.id === exId ? { ...e, sets: e.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) } : e)) }
  function removeSet(exId: string, si: number) { setExercises(es => es.map(e => e.id === exId ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e)) }
  function saveWorkout() {
    if (exercises.length === 0) return
    setHistory(h => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), exercises: [...exercises], notes: workoutNotes }, ...h.slice(0, 29)])
    alert('Workout saved!')
  }
  const totalVolume = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.reps * s.weight, 0), 0)

  return (
    <PageShell>
      <DesktopGrid columns={2}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Today's Workout</div>
            <select value={split} onChange={e => setSplit(e.target.value)} style={{ width: 'auto', fontSize: '0.75rem', padding: '4px 8px' }}>
              {DAY_SPLITS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {totalVolume > 0 && (
            <div style={{ background: '#0d1a0d', border: '1px solid #166534', borderRadius: 4, padding: '8px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Total volume: </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22C55E' }}>{totalVolume.toLocaleString()} lbs</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {exercises.map(ex => (
              <div key={ex.id} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4 }}>
                <div onClick={() => setExpanded(x => x === ex.id ? null : ex.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer' }}>
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{ex.name}</span>
                  <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>{ex.sets.length} sets</span>
                  {expanded === ex.id ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                  <button onClick={e => { e.stopPropagation(); setExercises(es => es.filter(x => x.id !== ex.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}><X size={13} /></button>
                </div>
                {expanded === ex.id && (
                  <div style={{ padding: '0 12px 12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 24px', gap: 6, marginBottom: 6 }}>
                      <div style={{ fontSize: '0.6rem', color: '#4B5563', textAlign: 'center' }}>#</div>
                      <div style={{ fontSize: '0.6rem', color: '#4B5563' }}>Weight (lbs)</div>
                      <div style={{ fontSize: '0.6rem', color: '#4B5563' }}>Reps</div>
                      <div />
                    </div>
                    {ex.sets.map((set, si) => (
                      <div key={si} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 24px', gap: 6, marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#4B5563' }}>{si + 1}</div>
                        <input type="number" value={set.weight || ''} placeholder="0" onChange={e => updateSet(ex.id, si, 'weight', parseFloat(e.target.value) || 0)} />
                        <input type="number" value={set.reps || ''} placeholder="0" onChange={e => updateSet(ex.id, si, 'reps', parseInt(e.target.value) || 0)} />
                        <button onClick={() => removeSet(ex.id, si)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}><X size={11} /></button>
                      </div>
                    ))}
                    <button onClick={() => addSet(ex.id)} className="btn-ghost" style={{ fontSize: '0.72rem', marginTop: 4 }}><Plus size={11} style={{ display: 'inline', marginRight: 4 }} />Add Set</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input type="text" placeholder="Exercise name..." value={exInput} onChange={e => setExInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExercise()} style={{ flex: 1 }} />
            <button onClick={addExercise} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4, padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>
          <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)} rows={2} placeholder="Workout notes..." style={{ marginBottom: 8, resize: 'none' }} />
          <button onClick={saveWorkout} disabled={exercises.length === 0} className="btn-amber">Save Workout to History</button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Workout History</div>
            <button onClick={() => setShowHistory(h => !h)} className="btn-ghost" style={{ fontSize: '0.7rem' }}>{showHistory ? 'Show less' : 'Show all'}</button>
          </div>
          {history.length === 0 && <div style={{ fontSize: '0.78rem', color: '#374151', textAlign: 'center', padding: '12px 0' }}>No history yet.</div>}
          {(showHistory ? history : history.slice(0, 8)).map(log => (
            <details key={log.id} style={{ background: '#181818', border: '1px solid #222', borderRadius: 4, marginBottom: 6, padding: '8px 12px' }}>
              <summary style={{ fontSize: '0.78rem', color: '#9CA3AF', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <span>{log.date}</span><span style={{ color: '#4B5563' }}>{log.exercises.length} exercises</span>
              </summary>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {log.exercises.map(ex => (
                  <div key={ex.id} style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{ex.name}</span>{' · '}{ex.sets.length} sets
                    {ex.sets.some(s => s.weight > 0) && ` · best ${Math.max(...ex.sets.map(s => s.weight))}lbs`}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </DesktopGrid>
    </PageShell>
  )
}
