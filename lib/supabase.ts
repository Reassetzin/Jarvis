let _supabase: any = null

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'https://placeholder.supabase.co') return null
  if (!_supabase) {
    const { createClient } = require('@supabase/supabase-js')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export const supabase = null

export const USER_ID = process.env.NEXT_PUBLIC_USER_ID || 'default-user'

export function shouldReset(lastReset: string | null): boolean {
  if (!lastReset) return true
  const last = new Date(lastReset)
  const now = new Date()
  const resetHour = 6
  const todayReset = new Date(now)
  todayReset.setHours(resetHour, 0, 0, 0)
  if (last < todayReset && now >= todayReset) return true
  return false
}

export function getTodayKey(): string {
  const now = new Date()
  const resetHour = 6
  if (now.getHours() < resetHour) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}
