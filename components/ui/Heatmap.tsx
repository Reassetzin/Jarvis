'use client'

interface Props {
  data: Record<string, number>   // 'YYYY-MM-DD' -> intensity value
  weeks?: number
  color?: string
  title?: string
  maxValue?: number
}

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export default function Heatmap({ data, weeks = 17, color = '#22C55E', title, maxValue }: Props) {
  const today = new Date()
  const days: Date[] = []
  // Start from (weeks*7) days ago, aligned to Sunday
  const start = new Date(today)
  start.setDate(today.getDate() - weeks * 7 + 1)
  start.setDate(start.getDate() - start.getDay()) // back to Sunday
  const totalDays = Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    days.push(d)
  }

  const max = maxValue || Math.max(1, ...Object.values(data))
  const cols: Date[][] = []
  for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7))

  function intensity(v: number) {
    if (!v) return 0
    const r = v / max
    if (r > 0.75) return 1
    if (r > 0.5) return 0.75
    if (r > 0.25) return 0.5
    return 0.28
  }

  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1
  cols.forEach((col, ci) => {
    const m = col[0].getMonth()
    if (m !== lastMonth) { monthLabels.push({ col: ci, label: col[0].toLocaleDateString('en-US', { month: 'short' }) }); lastMonth = m }
  })

  return (
    <div>
      {title && <div className="section-header">{title}</div>}
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {col.map((d, di) => {
              const key = ymd(d)
              const v = data[key] || 0
              const intens = intensity(v)
              const isFuture = d > today
              return (
                <div key={di} title={`${key}: ${v}`} style={{
                  width: '100%', aspectRatio: '1', minWidth: 9, borderRadius: 2,
                  background: isFuture ? 'transparent' : intens === 0 ? 'rgba(255,255,255,0.04)' : color,
                  opacity: isFuture ? 0 : intens === 0 ? 1 : intens,
                  boxShadow: intens > 0 && !isFuture ? `0 0 6px ${color}80` : 'none',
                }} />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>Less</span>
        {[0, 0.28, 0.5, 0.75, 1].map((o, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: o === 0 ? '#1a1a1a' : color, opacity: o === 0 ? 1 : o, border: '1px solid #0a0a0a' }} />
        ))}
        <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>More</span>
      </div>
    </div>
  )
}
