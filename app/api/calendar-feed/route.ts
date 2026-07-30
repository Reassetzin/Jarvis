import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Public one-way calendar feed (.ics) for Apple/Google Calendar subscriptions.
// GET /api/calendar-feed  → outputs Planner events + recurring tasks + dated tasks as VEVENTs.

const DOW = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function escapeText(s: string): string {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  // iCal lines should be folded at 75 octets; keep it simple for typical short lines
  if (line.length <= 75) return line
  const chunks: string[] = []
  let rest = line
  while (rest.length > 75) { chunks.push(rest.slice(0, 75)); rest = ' ' + rest.slice(75) }
  chunks.push(rest)
  return chunks.join('\r\n')
}

function dateStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
function allDayStamp(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const userId = process.env.NEXT_PUBLIC_USER_ID || 'default-user'
  if (!url || !key) return new NextResponse('Calendar sync not configured', { status: 500 })

  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('app_state').select('state').eq('user_id', userId).single()
  if (error || !data) return new NextResponse('No data found', { status: 404 })

  const state = data.state as Record<string, string>
  const parse = <T,>(key: string, fallback: T): T => {
    try { const raw = state[key]; return raw ? JSON.parse(raw) : fallback } catch { return fallback }
  }

  interface PEvent { id: string; title: string; date: string; time: string; type: string }
  interface PTask { id: string; text: string; date: string; done: boolean; category: string }
  interface PRecurring { id: string; text: string; category: string; days: number[]; createdAt: string }

  const events = parse<PEvent[]>('los_p_planner_events', [])
  const tasks = parse<PTask[]>('los_p_planner_tasks', [])
  const recurring = parse<PRecurring[]>('los_p_planner_recurring', [])

  const now = new Date()
  const lines: string[] = []
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Life OS//Planner Feed//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push('X-WR-CALNAME:Life OS Planner')
  lines.push('X-WR-TIMEZONE:America/New_York')
  lines.push('REFRESH-INTERVAL;VALUE=DURATION:PT4H')
  lines.push('X-PUBLISHED-TTL:PT4H')

  // Calendar Events (appointments, birthdays, meetings, etc.)
  events.forEach(e => {
    if (!e.date) return
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:jarvis-event-${e.id}@life-os`)
    lines.push(`DTSTAMP:${dateStamp(now)}`)
    if (e.time) {
      const [hh, mm] = e.time.split(':').map(Number)
      const start = new Date(`${e.date}T${e.time}:00`)
      const end = new Date(start.getTime() + 60 * 60000)
      const fmt = (d: Date) => `${e.date.replace(/-/g, '')}T${String(hh).padStart(2, '0')}${String(mm).padStart(2, '0')}00`
      lines.push(`DTSTART;TZID=America/New_York:${fmt(start)}`)
      const endHH = end.getHours(), endMM = end.getMinutes()
      lines.push(`DTEND;TZID=America/New_York:${e.date.replace(/-/g, '')}T${String(endHH).padStart(2, '0')}${String(endMM).padStart(2, '0')}00`)
    } else {
      lines.push(`DTSTART;VALUE=DATE:${allDayStamp(e.date)}`)
    }
    lines.push(foldLine(`SUMMARY:${escapeText((e.type ? e.type + ': ' : '') + e.title)}`))
    lines.push(`CATEGORIES:${escapeText(e.type || 'Event')}`)
    lines.push('END:VEVENT')
  })

  // Dated one-off planner tasks
  tasks.forEach(t => {
    if (!t.date) return
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:jarvis-task-${t.id}@life-os`)
    lines.push(`DTSTAMP:${dateStamp(now)}`)
    lines.push(`DTSTART;VALUE=DATE:${allDayStamp(t.date)}`)
    lines.push(foldLine(`SUMMARY:${escapeText('✓ ' + t.text)}`))
    lines.push(`CATEGORIES:${escapeText(t.category || 'Task')}`)
    lines.push(`STATUS:${t.done ? 'CONFIRMED' : 'TENTATIVE'}`)
    lines.push('END:VEVENT')
  })

  // Recurring tasks — native RRULE, weekly on chosen days
  recurring.forEach(r => {
    if (!r.days || r.days.length === 0 || !r.createdAt) return
    const byday = r.days.map(d => DOW[d]).join(',')
    // Anchor the first occurrence on/after createdAt that matches one of the days
    const start = new Date(r.createdAt + 'T09:00:00')
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:jarvis-recurring-${r.id}@life-os`)
    lines.push(`DTSTAMP:${dateStamp(now)}`)
    lines.push(`DTSTART;VALUE=DATE:${allDayStamp(r.createdAt)}`)
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byday}`)
    lines.push(foldLine(`SUMMARY:${escapeText('🔁 ' + r.text)}`))
    lines.push(`CATEGORIES:${escapeText(r.category || 'Recurring')}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')

  const body = lines.join('\r\n')
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="life-os-planner.ics"',
      'Cache-Control': 'public, max-age=1800',
    },
  })
}
