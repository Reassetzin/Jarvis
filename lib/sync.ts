'use client'
import { getSupabase, USER_ID } from './supabase'

// Syncs all `los_*` localStorage keys to a single Supabase table `app_state`.
// Table schema (one row per user):
//   user_id text primary key
//   state jsonb            -- { "los_p_transactions": "...", "los_water_ml": "...", ... }
//   updated_at timestamptz

let pushTimer: any = null
let lastPushedSnapshot = ''
let onlineStatus = true

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
let statusListeners: ((s: SyncStatus) => void)[] = []
let currentStatus: SyncStatus = 'idle'
export function onSyncStatus(fn: (s: SyncStatus) => void) {
  statusListeners.push(fn)
  fn(currentStatus)
  return () => { statusListeners = statusListeners.filter(l => l !== fn) }
}
function setStatus(s: SyncStatus) {
  currentStatus = s
  statusListeners.forEach(l => l(s))
}

function collectLocalState(): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.startsWith('los_'))) {
      const v = localStorage.getItem(k)
      if (v != null) out[k] = v
    }
  }
  return out
}

// Pull remote state and merge into localStorage. Remote wins on first load
// so a fresh device gets your data. Returns true if anything was applied.
export async function pullState(): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  try {
    const { data, error } = await sb.from('app_state').select('state').eq('user_id', USER_ID).maybeSingle()
    if (error) { console.warn('Supabase pull error:', error.message); return false }
    if (data?.state) {
      const remote: Record<string, string> = data.state
      Object.entries(remote).forEach(([k, v]) => {
        if (typeof v === 'string') localStorage.setItem(k, v)
      })
      lastPushedSnapshot = JSON.stringify(remote)
      return true
    }
  } catch (e) { console.warn('Supabase pull failed:', e) }
  return false
}

// Push current local state to Supabase (debounced).
export async function pushState(immediate = false) {
  const sb = getSupabase()
  if (!sb) return
  const doPush = async () => {
    const state = collectLocalState()
    const snapshot = JSON.stringify(state)
    if (snapshot === lastPushedSnapshot) return // nothing changed
    setStatus('syncing')
    try {
      const { error } = await sb.from('app_state').upsert({ user_id: USER_ID, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (error) { console.warn('Supabase push error:', error.message); setStatus('error'); return }
      lastPushedSnapshot = snapshot
      setStatus('synced')
    } catch (e) { console.warn('Supabase push failed:', e); setStatus('error') }
  }
  if (immediate) { await doPush(); return }
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(doPush, 1500)
}

export function isConfigured(): boolean {
  return !!getSupabase()
}

// Start the sync engine: pull once, then push on any localStorage change.
export async function initSync(onReady?: () => void) {
  if (!getSupabase()) { onReady?.(); return }

  // 1. Pull remote → local
  setStatus('syncing')
  await pullState()
  setStatus('synced')
  onReady?.()

  // 2. Patch localStorage.setItem to trigger a debounced push
  const origSet = localStorage.setItem.bind(localStorage)
  localStorage.setItem = (key: string, value: string) => {
    origSet(key, value)
    if (key.startsWith('los_')) pushState()
  }

  // 3. Push on tab hide / before unload (catch anything pending)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pushState(true)
  })
  window.addEventListener('beforeunload', () => { pushState(true) })

  // 4. Re-pull when coming back online / regaining focus
  window.addEventListener('online', () => { onlineStatus = true; setStatus('syncing'); pullState().then(() => setStatus('synced')) })
  window.addEventListener('offline', () => { onlineStatus = false; setStatus('offline') })
  window.addEventListener('focus', () => { if (onlineStatus) pullState() })
}
