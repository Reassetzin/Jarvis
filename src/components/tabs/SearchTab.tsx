'use client'
import { useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function SearchTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      const data = await res.json() as { response?: string; error?: string }
      setMessages([...updated, { role: 'assistant', content: data.response || data.error || 'Error' }])
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Connection failed' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      <div className="p-4 border-b border-[#222]">
        <div className="section-header" style={{ marginBottom: 0 }}>JARVIS AI</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-brand text-black' : 'bg-[#222] text-gray-200'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#222] px-3 py-2 rounded-lg text-sm text-gray-500">Thinking...</div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#222] flex gap-2">
        <input
          className="flex-1 bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white"
          placeholder="Ask Jarvis..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={loading} className="px-4 py-2 bg-brand text-black text-sm font-bold rounded disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  )
}
