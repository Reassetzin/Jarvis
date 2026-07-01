'use client'
import { useEffect, useState } from 'react'
import { initSync, isConfigured } from '@/lib/sync'
import { checkReminders } from '@/lib/notifications'
import SyncIndicator from '@/components/ui/SyncIndicator'
import SyncDebug from '@/components/ui/SyncDebug'

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    // If Supabase isn't configured, render immediately (pure localStorage mode)
    if (!isConfigured()) { setReady(true) }
    else {
      initSync(() => { if (!cancelled) setReady(true) })
      // Safety: never block the UI more than 3s even if network is slow
      const t = setTimeout(() => { if (!cancelled) setReady(true) }, 3000)
    }
    // Reminder checker — runs every minute while app is open
    checkReminders()
    const reminderTimer = setInterval(checkReminders, 60000)
    return () => { cancelled = true; clearInterval(reminderTimer) }
  }, [])

  if (!ready) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1f1f1f', borderTopColor: '#F59E0B', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Syncing your data…</div>
      </div>
    )
  }
  return <>{children}<SyncIndicator /><SyncDebug /></>
}
