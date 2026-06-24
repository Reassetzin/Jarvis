'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2) }

interface Meal {
  id: string
  meal_name: string
  calories: number
}

const GOAL = 2500

export default function CalorieTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, Meal[]>>({})
  const [mealName, setMealName] = useState('')
  const [calories, setCalories] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_calories')
    if (raw) setLogs(JSON.parse(raw) as Record<string, Meal[]>)
  }, [])

  const todayMeals = logs[today] || []
  const total = todayMeals.reduce((s, m) => s + m.calories, 0)
  const pct = Math.min(100, (total / GOAL) * 100)

  const add = () => {
    if (!mealName || !calories) return
    const meal: Meal = { id: newId(), meal_name: mealName, calories: Number(calories) }
    const updated = { ...logs, [today]: [...todayMeals, meal] }
    setLogs(updated)
    localStorage.setItem('jarvis_calories', JSON.stringify(updated))
    setMealName(''); setCalories('')
  }

  const del = (id: string) => {
    const updated = { ...logs, [today]: todayMeals.filter(m => m.id !== id) }
    setLogs(updated)
    localStorage.setItem('jarvis_calories', JSON.stringify(updated))
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white'

  return (
    <div className="card">
      <div className="section-header">CALORIES — {total} / {GOAL} kcal</div>
      <div className="w-full bg-[#222] rounded-full h-2 mb-3">
        <div className={`h-2 rounded-full transition-all ${total > GOAL ? 'bg-red-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
      </div>
      {todayMeals.map(m => (
        <div key={m.id} className="flex justify-between items-center py-1 border-b border-[#1a1a1a]">
          <span className="text-xs text-gray-300">{m.meal_name}</span>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-brand">{m.calories} kcal</span>
            <button onClick={() => del(m.id)} className="text-red-500 text-xs">✕</button>
          </div>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input className={`${inp} flex-1`} placeholder="Meal name" value={mealName} onChange={e => setMealName(e.target.value)} />
        <input className={`${inp} w-20`} type="number" placeholder="kcal" value={calories} onChange={e => setCalories(e.target.value)} />
        <button onClick={add} className="px-3 py-1 bg-brand text-black text-xs font-bold rounded">+</button>
      </div>
    </div>
  )
}
