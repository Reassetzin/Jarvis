'use client'
import { useState, useEffect } from 'react'
import { getLocalDate } from '@/lib/utils'

interface WhoopEntry {
  recovery: number
  sleep_pct: number
  strain: number
  hrv: number
  rhr: number
  ai_summary: string
}

export default function WhoopSection() {
  const today = getLocalDate()
  const [data, setData] = useState<Record<string, WhoopEntry>>({})
  const [form, setForm] = useState({ recovery: '', sleep_pct: '', strain: '', hrv: '', rhr: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('jarvis_whoop')
    if (raw) setData(JSON.parse(raw) as Record<string, WhoopEntry>)
  }, [])

  const todayData = data[today]

  const save = () => {
    const entry: WhoopEntry = {
      recovery: Number(form.recovery),
      sleep_pct: Number(form.sleep_pct),
      strain: Number(form.strain),
      hrv: Number(form.hrv),
      rhr: Number(form.rhr),
      ai_summary: todayData?.ai_summary || '',
    }
    const updated = { ...data, [today]: entry }
    setData(updated)
    localStorage.setItem('jarvis_whoop', JSON.stringify(updated))
  }

  const getAI = async () => {
    if (!todayData) return
    setLoading(true)
    try {
      const res = await fetch('/api/whoop-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whoopData: todayData }),
      })
      const result = await res.json() as { summary?: string; error?: string }
      const updated = { ...data, [today]: { ...todayData, ai_summary: result.summary || '' } }
      setData(updated)
      localStorage.setItem('jarvis_whoop', JSON.stringify(updated))
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const inp = 'bg-black border border-[#333] rounded px-2 py-1 text-sm text-white w-full'

  return (
    <div className="card">
      <div className="section-header">WHOOP</div>
      {todayData ? (
        <div>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {[['R', todayData.recovery, '%'], ['Z', todayData.sleep_pct, '%'], ['S', todayData.strain, ''], ['HRV', todayData.hrv, 'ms'], ['RHR', todayData.rhr, '']].map(([label, val, unit]) => (
              <div key={String(label)} className="text-center">
                <p className="text-[10px] text-gray-500">{label}</p>
                <p className="text-sm font-bold text-brand">{val}{unit}</p>
              </div>
            ))}
          </div>
          {todayData.ai_summary && (
            <p className="text-xs text-gray-300 mb-2 italic">{todayData.ai_summary}</p>
          )}
          <button onClick={getAI} disabled={loading} className="px-3 py-1 bg-[#222] text-xs text-gray-300 rounded">
            {loading ? 'Analyzing...' : 'Get AI Coaching'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs text-gray-500">Recovery %</label><input className={inp} type="number" value={form.recovery} onChange={e => setForm({ ...form, recovery: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500">Sleep %</label><input className={inp} type="number" value={form.sleep_pct} onChange={e => setForm({ ...form, sleep_pct: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500">Strain</label><input className={inp} type="number" step="0.1" value={form.strain} onChange={e => setForm({ ...form, strain: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500">HRV (ms)</label><input className={inp} type="number" value={form.hrv} onChange={e => setForm({ ...form, hrv: e.target.value })} /></div>
            <div><label className="text-xs text-gray-500">RHR (bpm)</label><input className={inp} type="number" value={form.rhr} onChange={e => setForm({ ...form, rhr: e.target.value })} /></div>
          </div>
          <button onClick={save} className="px-4 py-1.5 bg-brand text-black text-xs font-bold rounded">Save</button>
        </div>
      )}
    </div>
  )
}
