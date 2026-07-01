'use client'
import { useState } from 'react'
import { Send, Bot, Loader } from 'lucide-react'

export default function OverseerWidget() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/overseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', content: data.reply || 'No response.' }])
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'Failed to reach Overseer. Check API key.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#1a0a00',
          border: '1px solid var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={15} color="var(--accent)" />
        </div>
        <div>
          <div className="section-header" style={{ marginBottom: 0 }}>Overseer AI</div>
          <div style={{ fontSize: '0.6rem', color: '#4B5563' }}>Context-aware daily assistant</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className="animate-pulse-slow" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: '0.6rem', color: '#22C55E', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, maxHeight: 200, overflowY: 'auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '85%', padding: '8px 12px', borderRadius: 6,
                background: m.role === 'user' ? '#1a0a00' : '#111',
                border: `1px solid ${m.role === 'user' ? 'var(--accent-dim)' : '#222'}`,
                fontSize: '0.8rem', lineHeight: 1.5,
                color: m.role === 'user' ? 'var(--accent)' : '#E5E7EB',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: '0.75rem' }}>
              <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking...
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Ask Overseer anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ flex: 1, fontSize: '0.82rem' }}
        />
        <button onClick={send} disabled={loading} className={loading ? '' : 'glow-orange'} style={{
          background: loading ? '#1f1f1f' : 'var(--accent)',
          color: loading ? '#4B5563' : '#000',
          border: 'none', borderRadius: 4,
          padding: '0 14px', cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center',
        }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
