'use client'
import { useDailyStore } from '@/hooks/useStore'
import { Pill, Clock } from 'lucide-react'

const PK_STAGES = [
  { label: 'Onset', offsetMin: 0, durationMin: 30, color: '#6B7280', desc: 'Beginning to absorb' },
  { label: 'Peak', offsetMin: 30, durationMin: 120, color: 'var(--accent)', desc: 'Maximum effect' },
  { label: 'Plateau', offsetMin: 150, durationMin: 180, color: '#22C55E', desc: 'Sustained release' },
  { label: 'Wearing off', offsetMin: 330, durationMin: 90, color: '#F97316', desc: 'Declining effect' },
  { label: 'Cleared', offsetMin: 420, durationMin: 60, color: '#4B5563', desc: 'System clear' },
]

export default function MedicationTracker() {
  const [logs, setLogs] = useDailyStore<string[]>('concerta_logs', [])

  const lastLog = logs[logs.length - 1]
  const now = new Date()

  function logNow() {
    setLogs(l => [...l, now.toISOString()])
  }

  function getCurrentStage() {
    if (!lastLog) return null
    const takenAt = new Date(lastLog)
    const minutesSince = (now.getTime() - takenAt.getTime()) / 60000
    for (const stage of PK_STAGES) {
      if (minutesSince >= stage.offsetMin && minutesSince < stage.offsetMin + stage.durationMin) {
        return { stage, minutesSince, pct: (minutesSince - stage.offsetMin) / stage.durationMin }
      }
    }
    if (minutesSince >= 480) return { stage: { label: 'Cleared', offsetMin: 480, durationMin: 0, color: '#4B5563', desc: 'System clear' }, minutesSince, pct: 1 }
    return null
  }

  const current = getCurrentStage()
  const totalDuration = PK_STAGES.reduce((acc, s) => acc + s.durationMin, 0)

  return (
    <div className="card">
      <div className="section-header">Medication · Concerta</div>

      {!lastLog ? (
        <button onClick={logNow} className="btn-amber" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}>
          <Pill size={18} />
          I just took my Concerta
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Taken at</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>
                {new Date(lastLog).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
            {current && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Current phase</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: current.stage.color }}>{current.stage.label}</div>
              </div>
            )}
            <button onClick={logNow} style={{ background: '#111', border: '1px solid #333', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: '0.7rem', color: '#9CA3AF' }}>
              Re-log
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PK_STAGES.map((stage, i) => {
              const takenAt = new Date(lastLog)
              const stageStart = new Date(takenAt.getTime() + stage.offsetMin * 60000)
              const stageEnd = new Date(takenAt.getTime() + (stage.offsetMin + stage.durationMin) * 60000)
              const isActive = current?.stage.label === stage.label
              const isPast = now > stageEnd
              const isFuture = now < stageStart

              return (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  padding: '8px 10px', borderRadius: 4,
                  background: isActive ? `${stage.color}15` : 'transparent',
                  border: `1px solid ${isActive ? stage.color + '50' : '#1a1a1a'}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: isPast ? '#1f1f1f' : stage.color,
                    border: `1px solid ${stage.color}`,
                    opacity: isFuture ? 0.3 : 1,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isPast ? '#374151' : isFuture ? '#4B5563' : stage.color }}>
                      {stage.label}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#4B5563' }}>{stage.desc}</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4B5563', textAlign: 'right' }}>
                    <div>{stageStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                    <div>→ {stageEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <p style={{ fontSize: '0.62rem', color: '#374151', marginTop: 10, lineHeight: 1.5 }}>
            ⚠ Estimates are based on typical Concerta pharmacokinetics. Individual metabolism varies. Not medical advice.
          </p>
        </div>
      )}
    </div>
  )
}
