'use client'
import TopBar from '@/components/ui/TopBar'
import DayProgressRing from '@/components/main/DayProgressRing'
import Goalmaxxing from '@/components/main/Goalmaxxing'
import OverseerWidget from '@/components/main/OverseerWidget'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'

export default function MainTab() {
  const [goals] = useDailyStore<{ text: string; done: boolean; priority: boolean; id: string; date: string }[]>('goals_today', [])
  const [supps] = usePersistentStore<{ name: string; dose: string; time_of_day: string }[]>('supplements', [])

  const topGoal = goals.find(g => g.priority && !g.done) || goals.find(g => !g.done)
  const medReminder = supps.find(s => s.name.toLowerCase().includes('concerta'))

  return (
    <div>
      <TopBar />
      <div className="tab-scroll" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {(topGoal || medReminder) && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topGoal && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Goal</span>
                <span style={{ fontSize: '0.8rem', color: '#F3F4F6' }}>{topGoal.text}</span>
              </div>
            )}
            {medReminder && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Med</span>
                <span style={{ fontSize: '0.8rem', color: '#F3F4F6' }}>{medReminder.name} · {medReminder.dose} · {medReminder.time_of_day}</span>
              </div>
            )}
          </div>
        )}

        <DayProgressRing />
        <Goalmaxxing />
        <OverseerWidget />
      </div>
    </div>
  )
}
