'use client'
import { useEffect, useState } from 'react'

const NAME = 'Joao'

function timeOfDay(h: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (h < 5) return 'night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

// A rotating mix: warm, motivational, and chill greetings per time of day.
function buildGreetings(name: string, tod: string): { text: string; emoji: string }[] {
  const warm: Record<string, { text: string; emoji: string }> = {
    morning: { text: `Good morning, ${name}`, emoji: '☀️' },
    afternoon: { text: `Good afternoon, ${name}`, emoji: '🌤️' },
    evening: { text: `Good evening, ${name}`, emoji: '🌆' },
    night: { text: `Late night, ${name}`, emoji: '🌙' },
  }
  const motivational = [
    { text: `Let's make today count, ${name}`, emoji: '⚡' },
    { text: `One step at a time, ${name}`, emoji: '🎯' },
    { text: `You've got this, ${name}`, emoji: '💪' },
    { text: `Big things ahead, ${name}`, emoji: '🚀' },
  ]
  const chill = [
    { text: `Hey ${name}, welcome back`, emoji: '👋' },
    { text: `Good to see you, ${name}`, emoji: '😌' },
    { text: `What's the plan, ${name}?`, emoji: '✨' },
    { text: `Take it easy, ${name}`, emoji: '🍃' },
  ]
  return [warm[tod], ...motivational, ...chill]
}

function formatDate() { return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }

export default function TopBar() {
  const [time, setTime] = useState('')
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({ text: `Welcome back, ${NAME}`, emoji: '👋' })

  useEffect(() => {
    const now = new Date()
    const opts = buildGreetings(NAME, timeOfDay(now.getHours()))
    setGreeting(opts[Math.floor(Math.random() * opts.length)])

    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="topbar" style={{
      width: '100%',
      background: 'rgba(0,0,0,0.5)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      <div className="topbar-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.05rem', color: '#F3F4F6', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span>{greeting.text}</span>
            <span style={{ fontSize: '1rem' }}>{greeting.emoji}</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: '#6B7280', letterSpacing: '0.02em', fontWeight: 500, marginTop: 2 }}>{formatDate()} · {time}</div>
        </div>
      </div>
    </header>
  )
}
