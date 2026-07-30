'use client'
import { useState, useEffect } from 'react'
import { CalendarPlus, Copy, Check, ExternalLink } from 'lucide-react'

export default function CalendarSync() {
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const feedUrl = `${origin}/api/calendar-feed`
  const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://')

  function copyLink() {
    navigator.clipboard.writeText(feedUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Apple Calendar Sync</div>
        <CalendarPlus size={14} style={{ color: 'var(--accent)' }} />
      </div>
      <p style={{ fontSize: '0.72rem', color: '#9CA3AF', lineHeight: 1.45, marginBottom: 12 }}>
        Subscribe once and your Planner events, dated tasks, and recurring tasks will auto-show in Apple Calendar. One-way (Jarvis → Calendar), updates every few hours.
      </p>

      {origin && (
        <a href={webcalUrl} className="glow-orange" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--accent)', color: '#000',
          border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
          textDecoration: 'none', marginBottom: 8,
        }}>
          <CalendarPlus size={15} /> Add to Apple Calendar
        </a>
      )}

      <button onClick={copyLink} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: '#181818', color: '#9CA3AF', border: '1px solid #333', borderRadius: 8, padding: '9px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600,
      }}>
        {copied ? <><Check size={13} color="#22C55E" /> Copied</> : <><Copy size={13} /> Copy feed link</>}
      </button>

      <p style={{ fontSize: '0.58rem', color: '#4B5563', marginTop: 10, lineHeight: 1.4 }}>
        On iPhone: tap "Add to Apple Calendar" above, or go to Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar, and paste the link. Keep this link private — anyone with it can view your event titles.
      </p>
    </div>
  )
}
