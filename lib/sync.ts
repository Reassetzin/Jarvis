'use client'
import { getSupabase, USER_ID } from './supabase'

// Syncs all `los_*` localStorage keys to a single Supabase `app_state` row.
//   user_id text primary key | state jsonb | updated_at timestamptz

let pushTimer: any = null
let lastSyncedSnapshot = ''     // last snapshot known to match the cloud
let onlineStatus = true
let pushInFlight = false
let pendingLocalChange = false  // true when local has un-pushed edits
let rawSetItem: ((k: string, v: string) => void) | null = null

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
let statusListeners: ((s: SyncStatus) => void)[] = []
let currentStatus: SyncStatus = 'idle'
export function onSyncStatus(fn: (s: SyncStatus) => void) {
  statusListeners.push(fn)
  fn(currentStatus)
  return () => { statusListeners = statusListeners.filter(l => l !== fn) }
}
function setStatus(s: SyncStatus) { currentStatus = s; statusListeners.forEach(l => l(s)) }

function collectLocalState(): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('los_')) {
      const v = localStorage.getItem(k)
      if (v != null) out[k] = v
    }
  }
  return out
}

// Apply a remote state as the AUTHORITATIVE truth: overwrite local keys,
// AND remove local los_ keys that no longer exist remotely (handles deletes
// made on another device). Uses the raw setter so it doesn't trigger a push.
function applyRemote(remote: Record<string, string>) {
  const set = rawSetItem || localStorage.setItem.bind(localStorage)
  // Remove local los_ keys not present in remote
  const localKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('los_')) localKeys.push(k)
  }
  localKeys.forEach(k => { if (!(k in remote)) localStorage.removeItem(k) })
  // Write remote values
  Object.entries(remote).forEach(([k, v]) => { if (typeof v === 'string') set(k, v) })
  lastSyncedSnapshot = JSON.stringify(collectLocalState())
}

// Pull remote → local. Only applies if we have NO pending local changes,
// so a reload/focus can never clobber an edit that hasn't uploaded yet.
export async function pullState(force = false): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  if (pendingLocalChange && !force) return false // don't overwrite un-pushed edits
  try {
    const { data, error } = await sb.from('app_state').select('state').eq('user_id', USER_ID).maybeSingle()
    if (error) { console.warn('pull error:', error.message); return false }
    if (data?.state) {
      const remote: Record<string, string> = data.state
      const remoteSnap = JSON.stringify(remote)
      if (remoteSnap !== JSON.stringify(collectLocalState())) applyRemote(remote)
      else lastSyncedSnapshot = remoteSnap
      return true
    }
  } catch (e) { console.warn('pull failed:', e) }
  return false
}

async function doPush() {
  const sb = getSupabase()
  if (!sb) return
  const state = collectLocalState()
  const snapshot = JSON.stringify(state)
  if (snapshot === lastSyncedSnapshot) { pendingLocalChange = false; return }
  pushInFlight = true
  setStatus('syncing')
  try {
    const { error } = await sb.from('app_state').upsert(
      { user_id: USER_ID, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { console.warn('push error:', error.message); setStatus('error'); return }
    lastSyncedSnapshot = snapshot
    pendingLocalChange = false
    try { localStorage.removeItem('jarvis_sync_dirty') } catch {}
    setStatus('synced')
  } catch (e) { console.warn('push failed:', e); setStatus('error') }
  finally { pushInFlight = false }
}

export async function pushState(immediate = false) {
  if (!getSupabase()) return
  pendingLocalChange = true
  try { localStorage.setItem('los_sync_dirty', '1') } catch {}
  if (immediate) { if (pushTimer) clearTimeout(pushTimer); await doPush(); return }
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(doPush, 1200)
}

export function isConfigured(): boolean { return !!getSupabase() }

export async function initSync(onReady?: () => void) {
  if (!getSupabase()) { onReady?.(); return }

  // If the last session had un-pushed edits (e.g. deleted then reloaded fast),
  // local storage is the source of truth — push it up BEFORE any pull so the
  // change isn't clobbered by stale cloud data.
  const wasDirty = (() => { try { return localStorage.getItem('jarvis_sync_dirty') === '1' } catch { return false } })()

  setStatus('syncing')
  if (wasDirty) {
    pendingLocalChange = true
    await doPush()
  } else {
    await pullState(true)
  }
  setStatus('synced')
  onReady?.()

  // 2. Patch setItem so any los_ write schedules a push
  rawSetItem = localStorage.setItem.bind(localStorage)
  localStorage.setItem = (key: string, value: string) => {
    rawSetItem!(key, value)
    if (key.startsWith('los_')) pushState()
  }
  // Also catch removeItem so deletes push immediately
  const rawRemove = localStorage.removeItem.bind(localStorage)
  localStorage.removeItem = (key: string) => {
    rawRemove(key)
    if (key.startsWith('los_')) pushState()
  }

  // 3. Flush pending pushes when leaving
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pendingLocalChange) pushState(true)
  })
  window.addEventListener('beforeunload', () => { if (pendingLocalChange) pushState(true) })

  // 4. On focus/online: if we have pending edits, PUSH them first;
  //    otherwise pull to get changes from other devices.
  window.addEventListener('online', () => {
    onlineStatus = true
    if (pendingLocalChange) pushState(true)
    else pullState()
  })
  window.addEventListener('offline', () => { onlineStatus = false; setStatus('offline') })
  window.addEventListener('focus', () => {
    if (!onlineStatus || pushInFlight) return
    if (pendingLocalChange) pushState(true)
    else pullState()
  })
}
