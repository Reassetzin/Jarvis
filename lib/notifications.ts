'use client'
// Local notification helpers. Note: true scheduled push while the app is closed
// requires a push server (VAPID). This provides in-app reminders + permission mgmt,
// which works reliably when the PWA is open or recently backgrounded.

export function notifSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notifPermission(): NotificationPermission {
  if (!notifSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (!notifSupported()) return 'denied'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

export async function showNotification(title: string, body: string) {
  if (!notifSupported() || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: title })
    else new Notification(title, { body })
  } catch { try { new Notification(title, { body }) } catch {} }
}

// Reminder config stored in localStorage (synced)
export interface ReminderConfig {
  waterEnabled: boolean
  waterInterval: number // hours
  vitaminEnabled: boolean
  vitaminTime: string // 'HH:MM'
  plannerEnabled: boolean
}

export function getReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem('los_p_reminders')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { waterEnabled: false, waterInterval: 3, vitaminEnabled: false, vitaminTime: '09:00', plannerEnabled: false }
}

// Check-and-fire loop — call periodically while app is open.
// Uses last-fired timestamps to avoid duplicates.
export function checkReminders() {
  if (notifPermission() !== 'granted') return
  const cfg = getReminderConfig()
  const now = new Date()
  const nowMs = now.getTime()
  const fired = (() => { try { return JSON.parse(localStorage.getItem('reminder_fired') || '{}') } catch { return {} } })()

  // Water: every N hours between 8am-10pm
  if (cfg.waterEnabled && now.getHours() >= 8 && now.getHours() < 22) {
    const last = fired.water || 0
    if (nowMs - last >= cfg.waterInterval * 3600000) {
      showNotification('💧 Hydration check', 'Time to log some water.')
      fired.water = nowMs
    }
  }

  // Vitamins: at configured time (within a 30-min window, once/day)
  if (cfg.vitaminEnabled) {
    const [h, m] = cfg.vitaminTime.split(':').map(Number)
    const target = new Date(now); target.setHours(h, m, 0, 0)
    const dayKey = now.toDateString()
    if (nowMs >= target.getTime() && nowMs - target.getTime() < 1800000 && fired.vitaminDay !== dayKey) {
      showNotification('💊 Vitamins', "Don't forget your vitamins today.")
      fired.vitaminDay = dayKey
    }
  }

  // Planner: morning digest of today's tasks at 8am
  if (cfg.plannerEnabled) {
    const dayKey = now.toDateString()
    if (now.getHours() >= 8 && now.getHours() < 9 && fired.plannerDay !== dayKey) {
      try {
        const raw = localStorage.getItem('los_p_planner_tasks')
        const tasks = raw ? JSON.parse(raw) : []
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const todays = tasks.filter((t: any) => t.date === todayStr && !t.done)
        if (todays.length > 0) {
          showNotification('📅 Today\'s plan', `You have ${todays.length} task${todays.length > 1 ? 's' : ''} planned today.`)
          fired.plannerDay = dayKey
        }
      } catch {}
    }
  }

  try { localStorage.setItem('reminder_fired', JSON.stringify(fired)) } catch {}
}
