'use client'
import { useState, useEffect } from 'react'

export default function DayProgressRing() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const hours = now.getHours() + now.getMinutes() / 60
      const start = 6
      const end = 23
      const pct = Math.min(1, Math.max(0, (hours - start) / (end - start)))
      setProgress(pct)
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [])

  const r = 20
  const circ = 2 * Math.PI * r
  const dash = progress * circ

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={r} fill="none" stroke="#222" strokeWidth="4" />
        <circle
          cx="25" cy="25" r={r} fill="none"
          stroke="#F59E0B" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
        />
        <text x="25" y="29" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Inter">
          {Math.round(progress * 100)}%
        </text>
      </svg>
      <span className="text-xs text-gray-500">Day Progress (6AM-11PM)</span>
    </div>
  )
}
