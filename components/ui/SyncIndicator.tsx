'use client'
import { useEffect, useState } from 'react'
import { onSyncStatus, isConfigured } from '@/lib/sync'
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react'

export const APP_VERSION = '1.12.0'

export default function SyncIndicator() {
  const [status, setStatus] = useState<string>('idle')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isConfigured()) return
    setShow(true)
    return onSyncStatus(setStatus)
  }, [])

  const meta: Record<string, { icon: any; color: string; label: string }> = {
    idle: { icon: Cloud, color: '#4B5563', label: 'Cloud' },
    syncing: { icon: RefreshCw, color: 'var(--accent)', label: 'Syncing' },
    synced: { icon: Check, color: '#22C55E', label: 'Synced' },
    offline: { icon: CloudOff, color: '#6B7280', label: 'Offline' },
    error: { icon: AlertCircle, color: '#EF4444', label: 'Sync error' },
  }
  const m = meta[status] || meta.idle
  const Icon = m.icon

  return (
    <div style={{
      position: 'fixed', top: 'calc(env(safe-area-inset-top) + 8px)', right: 12, zIndex: 300,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3,
    }}>
      {show && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,10,12,0.6)',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
          padding: '4px 10px', fontSize: '0.6rem', color: m.color, fontWeight: 600,
        }}>
          <Icon size={11} color={m.color} style={{ animation: status === 'syncing' ? 'spin 0.8s linear infinite' : 'none' }} />
          {m.label}
        </div>
      )}
      <span style={{ fontSize: '0.5rem', color: '#4B5563', fontWeight: 500, paddingRight: 4 }}>v{APP_VERSION}</span>
    </div>
  )
}
