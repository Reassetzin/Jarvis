'use client'
import { usePersistentStore } from '@/hooks/useStore'
import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { notifSupported, notifPermission, requestNotifPermission, showNotification, ReminderConfig } from '@/lib/notifications'

export default function NotificationSettings() {
  const [cfg, setCfg] = usePersistentStore<ReminderConfig>('reminders', { waterEnabled: false, waterInterval: 3, vitaminEnabled: false, vitaminTime: '09:00', plannerEnabled: false })
  const [perm, setPerm] = useState<NotificationPermission>('default')

  useEffect(() => { setPerm(notifPermission()) }, [])

  async function enable() {
    const p = await requestNotifPermission()
    setPerm(p)
    if (p === 'granted') showNotification('✅ Notifications on', 'Jarvis will remind you about your habits.')
  }

  if (!notifSupported()) {
    return (
      <div className="card">
        <div className="section-header">Reminders</div>
        <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Notifications aren't supported in this browser. On iPhone, add Jarvis to your home screen first (iOS 16.4+).</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Reminders</div>
        {perm === 'granted' ? <Bell size={14} color="#22C55E" /> : <BellOff size={14} color="#6B7280" />}
      </div>

      {perm !== 'granted' ? (
        <div>
          <p style={{ fontSize: '0.74rem', color: '#9CA3AF', marginBottom: 10, lineHeight: 1.4 }}>Enable notifications to get reminders for water, vitamins, and your daily plan.</p>
          <button onClick={enable} className="glow-orange" style={{ width: '100%', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Bell size={14} /> Enable Notifications
          </button>
          {perm === 'denied' && <p style={{ fontSize: '0.6rem', color: '#EF4444', marginTop: 8 }}>Blocked. Enable in your browser/device settings for this site.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Toggle label="💧 Water reminders" sub={`Every ${cfg.waterInterval}h, 8am–10pm`} on={cfg.waterEnabled} onToggle={() => setCfg(c => ({ ...c, waterEnabled: !c.waterEnabled }))} />
          {cfg.waterEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
              <span style={{ fontSize: '0.66rem', color: '#6B7280' }}>Every</span>
              <select value={cfg.waterInterval} onChange={e => setCfg(c => ({ ...c, waterInterval: Number(e.target.value) }))} style={{ width: 'auto', fontSize: '0.72rem', padding: '4px 8px' }}>
                {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h}h</option>)}
              </select>
            </div>
          )}
          <Toggle label="💊 Vitamin reminder" sub={`Daily at ${cfg.vitaminTime}`} on={cfg.vitaminEnabled} onToggle={() => setCfg(c => ({ ...c, vitaminEnabled: !c.vitaminEnabled }))} />
          {cfg.vitaminEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
              <span style={{ fontSize: '0.66rem', color: '#6B7280' }}>At</span>
              <input type="time" value={cfg.vitaminTime} onChange={e => setCfg(c => ({ ...c, vitaminTime: e.target.value }))} style={{ width: 'auto', fontSize: '0.72rem', padding: '4px 8px' }} />
            </div>
          )}
          <Toggle label="📅 Daily plan digest" sub="Morning summary at 8am" on={cfg.plannerEnabled} onToggle={() => setCfg(c => ({ ...c, plannerEnabled: !c.plannerEnabled }))} />
          <p style={{ fontSize: '0.58rem', color: '#374151', lineHeight: 1.4 }}>Reminders fire while the app is open or recently active. For always-on delivery, keep Jarvis on your home screen.</p>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: '#E5E7EB' }}>{label}</div>
        <div style={{ fontSize: '0.6rem', color: '#6B7280' }}>{sub}</div>
      </div>
      <button onClick={onToggle} style={{
        width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
        background: on ? '#22C55E' : '#333', transition: 'background 0.2s',
      }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  )
}
