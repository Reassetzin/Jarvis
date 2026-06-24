'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

const DEFAULT_SUPPLEMENTS = ['Creatine', 'Vitamin D', 'Omega-3', 'Magnesium', 'Zinc', 'B-Complex', 'Ashwagandha']

interface SupplementLog {
  morning: boolean
  lunch: boolean
  evening: boolean
}

export default function SupplementTracker() {
  const today = getLocalDate()
  const [logs, setLogs] = useState<Record<string, Record<string, SupplementLog>>>({})
  const [stock, setStock] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const l = localStorage.getItem('jarvis_supplements')
    if (l) setLogs(JSON.parse(l) as Record<string, Record<string, SupplementLog>>)
    const s = localStorage.getItem('jarvis_supplement_stock')
    if (s) setStock(JSON.parse(s) as Record<string, boolean>)
  }, [])

  const getLog = (name: string): SupplementLog => logs[today]?.[name] || { morning: false, lunch: false, evening: false }

  const toggle = (name: string, timing: 'morning' | 'lunch' | 'evening') => {
    const current = getLog(name)
    const updated = {
      ...logs,
      [today]: {
        ...(logs[today] || {}),
        [name]: { ...current, [timing]: !current[timing] },
      },
    }
    setLogs(updated)
    localStorage.setItem('jarvis_supplements', JSON.stringify(updated))
  }

  const toggleStock = (name: string) => {
    const updated = { ...stock, [name]: !stock[name] }
    setStock(updated)
    localStorage.setItem('jarvis_supplement_stock', JSON.stringify(updated))
  }

  return (
    <div className="card">
      <div className="section-header">SUPPLEMENTS</div>
      <div className="grid grid-cols-4 text-[10px] text-gray-500 mb-1 px-1">
        <span></span>
        <span className="text-center">AM</span>
        <span className="text-center">PM</span>
        <span className="text-center">EVE</span>
      </div>
      {DEFAULT_SUPPLEMENTS.map(name => {
        const log = getLog(name)
        return (
          <div key={name} className="grid grid-cols-4 items-center py-1.5 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-300">{name}</span>
              {stock[name] && <span className="text-[9px] text-red-400">LOW</span>}
            </div>
            {(['morning', 'lunch', 'evening'] as const).map(t => (
              <button
                key={t}
                onClick={() => toggle(name, t)}
                className={`mx-auto w-5 h-5 rounded border text-[10px] ${log[t] ? 'bg-brand border-brand text-black' : 'border-[#333] text-gray-600'}`}
              >
                {log[t] ? '✓' : ''}
              </button>
            ))}
          </div>
        )
      })}
      <div className="mt-2">
        <p className="text-[10px] text-gray-500 mb-1">Running Low:</p>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_SUPPLEMENTS.map(name => (
            <button
              key={name}
              onClick={() => toggleStock(name)}
              className={`px-2 py-0.5 text-[10px] rounded ${stock[name] ? 'bg-red-900 text-red-300' : 'bg-[#222] text-gray-500'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
