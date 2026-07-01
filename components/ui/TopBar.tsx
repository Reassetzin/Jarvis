'use client'
import { useEffect, useState } from 'react'

function formatDate() { return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() }

export default function TopBar() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="topbar" style={{
      width: '100%',
      background: 'rgba(0,0,0,0.5)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      <div className="topbar-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', letterSpacing: '0.08em', fontWeight: 600 }}>{formatDate()}</div>
          <div style={{ fontSize: '0.9rem', color: '#F3F4F6', fontWeight: 700, letterSpacing: '0.02em' }}>{time}</div>
        </div>
      </div>
    </header>
  )
}
