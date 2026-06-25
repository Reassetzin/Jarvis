'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

export interface Idea {
  id: string; text: string; status: 'idea' | 'planned' | 'shipped'
  notes?: string; date?: string; platform?: string; hook?: string; script?: string
}

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X', 'LinkedIn', 'Multiple']

export default function IdeaEditor({ idea, onSave, onClose }: { idea: Idea; onSave: (i: Idea) => void; onClose: () => void }) {
  const [form, setForm] = useState<Idea>({ ...idea })
  const up = (k: keyof Idea, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Edit Content Idea</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Title">
            <input type="text" value={form.text} onChange={e => up('text', e.target.value)} placeholder="Content title" />
          </Field>

          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Platform" style={{ flex: 1 }}>
              <select value={form.platform || ''} onChange={e => up('platform', e.target.value)}>
                <option value="">Select...</option>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status" style={{ flex: 1 }}>
              <select value={form.status} onChange={e => up('status', e.target.value as any)}>
                <option value="idea">Idea</option>
                <option value="planned">Planned</option>
                <option value="shipped">Shipped</option>
              </select>
            </Field>
            <Field label="Target Date" style={{ flex: 1 }}>
              <input type="date" value={form.date || ''} onChange={e => up('date', e.target.value)} />
            </Field>
          </div>

          <Field label="Hook / Caption">
            <input type="text" value={form.hook || ''} onChange={e => up('hook', e.target.value)} placeholder="The opening line / hook" />
          </Field>

          <Field label="Notes">
            <textarea rows={3} value={form.notes || ''} onChange={e => up('notes', e.target.value)} placeholder="Concept, references, ideas..." style={{ resize: 'vertical' }} />
          </Field>

          <Field label="Script / Outline">
            <textarea rows={6} value={form.script || ''} onChange={e => up('script', e.target.value)} placeholder="Full script or shot-by-shot outline..." style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.78rem' }} />
          </Field>

          <button onClick={() => { onSave(form); onClose() }} className="btn-amber">Save Idea</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  )
}
