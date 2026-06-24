'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface GymSet {
  id: string
  exercise_name: string
  date: string
  weight_kg: number
  reps: number
  gym_name: string
}

interface GymSettings {
  gym: string
  day_type: string
}

const dayExercises: Record<string, string[]> = {
  Push: ['Bench Press', 'OHP', 'Tricep Pushdown', 'Lateral Raise'],
  Pull: ['Deadlift', 'Pull-up', 'Barbell Row', 'Bicep Curl'],
  Legs: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise'],
  Upper: ['Bench Press', 'OHP', 'Barbell Row', 'Bicep Curl'],
  Lower: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise'],
  'Full Body': ['Squat', 'Bench Press', 'Deadlift', 'OHP'],
}

const DAY_TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body']

export default function GymTab() {
  const today = getLocalDate()
  const [sets, setSets] = useState<GymSet[]>([])
  const [settings, setSettings] = useState<GymSettings>({ gym: '', day_type: 'Push' })
  const [selectedExercise, setSelectedExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  useEffect(() => {
    const s = localStorage.getItem('jarvis_gym_sets')
    if (s) setSets(JSON.parse(s) as GymSet[])
    const gs = localStorage.getItem('jarvis_gym_settings')
    if (gs) setSettings(JSON.parse(gs) as GymSettings)
  }, [])

  const saveSettings = (updated: GymSettings) => {
    setSettings(updated)
    localStorage.setItem('jarvis_gym_settings', JSON.stringify(updated))
  }

  const exercises = dayExercises[settings.day_type] || dayExercises['Full Body']
  const todaySets = sets.filter(s => s.date === today && s.exercise_name === selectedExercise)
  const allForExercise = sets.filter(s => s.exercise_name === selectedExercise).sort((a, b) => a.date.localeCompare(b.date))

  const chartData = Array.from(
    allForExercise.reduce((map, s) => {
      const cur = map.get(s.date)
      if (!cur || s.weight_kg > cur) map.set(s.date, s.weight_kg)
      return map
    }, new Map<string, number>())
  ).map(([date, weight_kg]) => ({ date: date.slice(5), weight_kg }))

  const prevBest = allForExercise.filter(s => s.date < today).reduce((best, s) => s.weight_kg > best ? s.weight_kg : best, 0)

  const logSet = () => {
    if (!selectedExercise || !weight) return
    const s: GymSet = {
      id: newId(),
      exercise_name: selectedExercise,
      date: today,
      weight_kg: Number(weight),
      reps: Number(reps),
      gym_name: settings.gym,
    }
    const updated = [...sets, s]
    setSets(updated)
    localStorage.setItem('jarvis_gym_sets', JSON.stringify(updated))
    setWeight(''); setReps('')
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="section-header">GYM</div>
        <input
          className={`${inp} w-full mb-3`}
          placeholder="Gym name"
          value={settings.gym}
          onChange={e => saveSettings({ ...settings, gym: e.target.value })}
        />
        <div className="flex flex-wrap gap-1">
          {DAY_TYPES.map(dt => (
            <button
              key={dt}
              onClick={() => { saveSettings({ ...settings, day_type: dt }); setSelectedExercise('') }}
              className={`px-2 py-1 text-xs rounded ${settings.day_type === dt ? 'bg-brand text-black font-bold' : 'bg-[#222] text-gray-400'}`}
            >
              {dt}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-header">EXERCISES — {settings.day_type}</div>
        <div className="flex flex-wrap gap-2">
          {exercises.map(ex => (
            <button
              key={ex}
              onClick={() => setSelectedExercise(ex)}
              className={`px-2 py-1 text-xs rounded ${selectedExercise === ex ? 'bg-brand text-black font-bold' : 'bg-[#222] text-gray-400'}`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {selectedExercise && (
        <>
          <div className="card">
            <div className="section-header">{selectedExercise}</div>
            {prevBest > 0 && <p className="text-xs text-gray-500 mb-2">Previous best: {prevBest}kg</p>}
            <div className="flex gap-2 mb-3">
              <input className={`${inp} w-24`} type="number" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} />
              <input className={`${inp} w-20`} type="number" placeholder="reps" value={reps} onChange={e => setReps(e.target.value)} />
              <button onClick={logSet} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">Log</button>
            </div>
            {todaySets.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Today&apos;s sets:</p>
                {todaySets.map((s, i) => (
                  <div key={s.id} className="text-xs text-gray-300 py-1 border-b border-[#222]">
                    Set {i + 1}: {s.weight_kg}kg × {s.reps} reps
                  </div>
                ))}
              </div>
            )}
          </div>

          {chartData.length > 1 && (
            <div className="card">
              <div className="section-header">WEIGHT PROGRESSION</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff', fontSize: 12 }} />
                  <Line type="monotone" dataKey="weight_kg" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
