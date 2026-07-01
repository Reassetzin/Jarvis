'use client'
import { useEffect, useState } from 'react'
import { getSyncLog, forcePushNow } from '@/lib/sync'

export default function SyncDebug() {
  const [log, setLog] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setLog(getSyncLog()), 500)
    return () => clearInterval(t)
  }, [])

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 12px)', right: 12, zIndex: 500,
        background: 'rgba(139,92,246,0.9)', color: '#fff', border: 'none', borderRadius: 20,
        padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
      }}>🐞 Sync</button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 12px)', left: 12, right: 12, zIndex: 500,
      background: 'rgba(10,10,12,0.97)', border: '1px solid #333', borderRadius: 12, padding: 14,
      maxHeight: '50vh', overflowY: 'auto', fontSize: '0.68rem', fontFamily: 'monospace', color: '#E5E7EB',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ color: '#8B5CF6' }}>Sync Debug</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => forcePushNow()} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.65rem' }}>Force Push</button>
          <button onClick={() => setOpen(false)} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.65rem' }}>Close</button>
        </div>
      </div>
      {log.length === 0 && <div style={{ color: '#6B7280' }}>No log entries yet. Make a change (e.g. water) and watch here.</div>}
      {log.map((line, i) => (
        <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #1a1a1a', color: line.includes('ERROR') || line.includes('FAIL') ? '#EF4444' : line.includes('OK') || line.includes('SUCCESS') ? '#22C55E' : '#9CA3AF' }}>{line}</div>
      ))}
    </div>
  )
}
