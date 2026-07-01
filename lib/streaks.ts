'use client'
// Records daily completion history for habit streaks.
// Stored under los_p_streak_history: { [category]: { 'YYYY-MM-DD': true } }

export type StreakCategory = 'water' | 'vitamins' | 'activity'

function todayKey(): string {
  const now = new Date()
  const h = now.getHours()
  // Align to 6am reset like the rest of the app
  const d = new Date(now)
  if (h < 6) d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function read(): Record<string, Record<string, boolean>> {
  try {
    const raw = localStorage.getItem('los_p_streak_history')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function write(data: Record<string, Record<string, boolean>>) {
  localStorage.setItem('los_p_streak_history', JSON.stringify(data))
}

// Mark a category complete for today (idempotent)
export function markComplete(cat: StreakCategory) {
  const data = read()
  if (!data[cat]) data[cat] = {}
  const key = todayKey()
  if (!data[cat][key]) {
    data[cat][key] = true
    write(data)
    // trigger sync
    import('./sync').then(m => m.pushState()).catch(() => {})
  }
}

// Compute current streak (consecutive days up to today) for a category
export function getStreak(cat: StreakCategory): number {
  const data = read()
  const hist = data[cat] || {}
  let streak = 0
  const cursor = new Date()
  if (cursor.getHours() < 6) cursor.setDate(cursor.getDate() - 1)
  // Walk backwards from today
  for (let i = 0; i < 3650; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    if (hist[key]) { streak++; cursor.setDate(cursor.getDate() - 1) }
    else break
  }
  return streak
}

// Longest streak ever
export function getBestStreak(cat: StreakCategory): number {
  const data = read()
  const hist = data[cat] || {}
  const days = Object.keys(hist).filter(k => hist[k]).sort()
  if (days.length === 0) return 0
  let best = 1, cur = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]); const curr = new Date(days[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) { cur++; best = Math.max(best, cur) } else { cur = 1 }
  }
  return best
}

export function isCompleteToday(cat: StreakCategory): boolean {
  const data = read()
  return !!(data[cat] && data[cat][todayKey()])
}
