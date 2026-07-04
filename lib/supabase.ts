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

// Current calendar date in Eastern Time (America/New_York), as YYYY-MM-DD.
// A new day begins at midnight ET. Handles EST/EDT automatically.
export function getEasternDateStr(d: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD formatting
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function shouldReset(lastReset: string | null): boolean {
  if (!lastReset) return true
  // Reset when the Eastern-time calendar day has changed since lastReset.
  return getEasternDateStr(new Date(lastReset)) !== getEasternDateStr(new Date())
}

export function getTodayKey(): string {
  return getEasternDateStr()
}
