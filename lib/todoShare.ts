'use client'
// Generate a shareable summary of To-Do lists — as text or a canvas image.

interface Todo { id: string; text: string; done: boolean; tags: string[]; doneTags?: string[]; note?: string }
interface Group { id: string; name: string; color: string; todos: Todo[]; tags?: string[] }

const UNTAGGED = '__untagged__'

function isFullyDone(t: Todo) {
  const tags = t.tags || []
  if (tags.length === 0) return t.done
  return tags.every(tg => (t.doneTags || []).includes(tg))
}

function groupCounts(g: Group) {
  let total = 0, done = 0
  g.todos.forEach(t => {
    const tags = t.tags || []
    if (tags.length === 0) { total += 1; if (t.done) done += 1 }
    else { total += tags.length; done += (t.doneTags || []).filter(tg => tags.includes(tg)).length }
  })
  return { total, done }
}

export function buildTodoText(groups: Group[], onlyGroupId?: string): string {
  const list = onlyGroupId ? groups.filter(g => g.id === onlyGroupId) : groups
  const lines: string[] = []
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  lines.push(`To-Do Summary — ${date}`)
  lines.push('')
  list.forEach(g => {
    const c = groupCounts(g)
    const pct = c.total ? Math.round((c.done / c.total) * 100) : 0
    lines.push(`${g.name}  (${c.done}/${c.total} done · ${pct}%)`)
    const tags = g.tags || []
    if (tags.length > 0) {
      tags.forEach(tag => {
        const items = g.todos.filter(t => (t.tags || []).includes(tag))
        if (!items.length) return
        lines.push(`  ${tag}:`)
        items.forEach(t => {
          const done = (t.doneTags || []).includes(tag)
          lines.push(`    ${done ? '✓' : '○'} ${t.text}`)
          if (t.note) lines.push(`        ↳ ${t.note.replace(/\n/g, ' ')}`)
        })
      })
      const untagged = g.todos.filter(t => (t.tags || []).length === 0)
      if (untagged.length) {
        lines.push(`  Other:`)
        untagged.forEach(t => { lines.push(`    ${t.done ? '✓' : '○'} ${t.text}`); if (t.note) lines.push(`        ↳ ${t.note.replace(/\n/g, ' ')}`) })
      }
    } else {
      g.todos.forEach(t => { lines.push(`  ${t.done ? '✓' : '○'} ${t.text}`); if (t.note) lines.push(`      ↳ ${t.note.replace(/\n/g, ' ')}`) })
    }
    lines.push('')
  })
  return lines.join('\n').trim()
}

// Render the summary to a PNG canvas and return a blob URL + blob.
export async function buildTodoImage(groups: Group[], onlyGroupId?: string, accent = '#F59E0B'): Promise<{ url: string; blob: Blob }> {
  const list = onlyGroupId ? groups.filter(g => g.id === onlyGroupId) : groups
  const scale = 2
  const W = 720
  const pad = 40

  // Rough note line estimate: ~64 chars per line at this width
  const noteLines = (note?: string) => note ? Math.max(1, Math.ceil(note.length / 64)) + (note.match(/\n/g)?.length || 0) : 0
  const itemH = (t: Todo) => 30 + noteLines(t.note) * 18

  // Measure required height first
  let h = pad
  h += 54 // title
  h += 28 // date
  h += 20
  list.forEach(g => {
    h += 44 // group header
    h += 22 // progress bar
    const tags = g.tags || []
    if (tags.length > 0) {
      tags.forEach(tag => {
        const items = g.todos.filter(t => (t.tags || []).includes(tag))
        if (!items.length) return
        h += 30 // tag header
        items.forEach(t => { h += itemH(t) })
      })
      const untagged = g.todos.filter(t => (t.tags || []).length === 0)
      if (untagged.length) { h += 30; untagged.forEach(t => { h += itemH(t) }) }
    } else {
      g.todos.forEach(t => { h += itemH(t) })
    }
    h += 26 // group spacing
  })
  h += pad

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Background
  ctx.fillStyle = '#0a0a0c'
  ctx.fillRect(0, 0, W, h)
  // Accent bar on left
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 6, h)

  let y = pad
  // Title
  ctx.fillStyle = '#F3F4F6'
  ctx.font = '700 30px -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.fillText('To-Do Summary', pad, y + 26)
  y += 54
  // Date
  ctx.fillStyle = '#6B7280'
  ctx.font = '400 15px -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.fillText(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), pad, y + 12)
  y += 44

  const drawItem = (text: string, done: boolean, x: number, note?: string) => {
    // checkbox
    ctx.strokeStyle = done ? '#22C55E' : '#3a3a3a'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x, y + 3, 15, 15)
    if (done) {
      ctx.fillStyle = '#22C55E'
      ctx.fillRect(x, y + 3, 15, 15)
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x + 3, y + 10); ctx.lineTo(x + 6, y + 13); ctx.lineTo(x + 12, y + 6); ctx.stroke()
    }
    ctx.fillStyle = done ? '#4B5563' : '#E5E7EB'
    ctx.font = '400 15px -apple-system, Segoe UI, Roboto, sans-serif'
    let label = text
    const maxW = W - x - 60
    while (ctx.measureText(label).width > maxW && label.length > 4) label = label.slice(0, -2)
    if (label !== text) label = label.slice(0, -1) + '…'
    ctx.fillText(label, x + 24, y + 15)
    y += 30
    // Note (wrapped, indented, accent-colored)
    if (note) {
      ctx.fillStyle = accent
      ctx.font = 'italic 400 13px -apple-system, Segoe UI, Roboto, sans-serif'
      const noteX = x + 24
      const noteMaxW = W - noteX - 50
      const words = note.replace(/\n/g, ' ').split(' ')
      let line = '↳ '
      words.forEach(word => {
        const test = line + word + ' '
        if (ctx.measureText(test).width > noteMaxW && line !== '↳ ') {
          ctx.fillText(line.trimEnd(), noteX, y + 10)
          y += 18
          line = word + ' '
        } else line = test
      })
      if (line.trim()) { ctx.fillText(line.trimEnd(), noteX, y + 10); y += 18 }
    }
  }

  list.forEach(g => {
    const c = groupCounts(g)
    const pct = c.total ? Math.round((c.done / c.total) * 100) : 0
    // Group name
    ctx.fillStyle = g.color
    ctx.font = '800 19px -apple-system, Segoe UI, Roboto, sans-serif'
    ctx.fillText(g.name, pad, y + 16)
    ctx.fillStyle = '#6B7280'
    ctx.font = '600 13px -apple-system, Segoe UI, Roboto, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${c.done}/${c.total} · ${pct}%`, W - pad, y + 15)
    ctx.textAlign = 'left'
    y += 30
    // Progress bar
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(pad, y, W - pad * 2, 6)
    ctx.fillStyle = pct === 100 ? '#22C55E' : g.color
    ctx.fillRect(pad, y, (W - pad * 2) * (pct / 100), 6)
    y += 22

    const tags = g.tags || []
    if (tags.length > 0) {
      tags.forEach(tag => {
        const items = g.todos.filter(t => (t.tags || []).includes(tag))
        if (!items.length) return
        ctx.fillStyle = g.color
        ctx.font = '700 12px -apple-system, Segoe UI, Roboto, sans-serif'
        ctx.fillText(tag.toUpperCase(), pad + 4, y + 12)
        y += 30
        items.forEach(t => drawItem(t.text, (t.doneTags || []).includes(tag), pad + 12, t.note))
      })
      const untagged = g.todos.filter(t => (t.tags || []).length === 0)
      if (untagged.length) {
        ctx.fillStyle = '#6B7280'
        ctx.font = '700 12px -apple-system, Segoe UI, Roboto, sans-serif'
        ctx.fillText('OTHER', pad + 4, y + 12)
        y += 30
        untagged.forEach(t => drawItem(t.text, t.done, pad + 12, t.note))
      }
    } else {
      g.todos.forEach(t => drawItem(t.text, t.done, pad, t.note))
    }
    y += 26
  })

  return new Promise((resolve) => {
    canvas.toBlob(blob => {
      const b = blob!
      resolve({ url: URL.createObjectURL(b), blob: b })
    }, 'image/png')
  })
}
