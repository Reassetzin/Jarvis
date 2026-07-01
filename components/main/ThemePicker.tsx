'use client'
import { useState, useEffect } from 'react'
import { THEMES, getSavedTheme, saveTheme } from '@/lib/theme'
import { Check, Palette } from 'lucide-react'

export default function ThemePicker() {
  const [active, setActive] = useState('amber')
  useEffect(() => { setActive(getSavedTheme()) }, [])

  function pick(id: string) { setActive(id); saveTheme(id) }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Theme</div>
        <Palette size={14} style={{ color: 'var(--accent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => pick(t.id)} title={t.name} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: active === t.id ? '2px solid #fff' : '2px solid transparent',
              boxShadow: active === t.id ? `0 0 14px ${t.accent}` : 'none', transition: 'all 0.15s',
            }}>
              {active === t.id && <Check size={16} color="#000" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: '0.58rem', color: active === t.id ? '#E5E7EB' : '#6B7280' }}>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
