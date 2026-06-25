'use client'
import TopBar from '@/components/ui/TopBar'
import DayProgressRing from '@/components/main/DayProgressRing'
import Goalmaxxing from '@/components/main/Goalmaxxing'
import OverseerWidget from '@/components/main/OverseerWidget'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'

export default function MainTab() {
  const [goals] = useDailyStore<{ text: string; done: boolean; priority: boolean; id: string; date: string }[]>('goals_today', [])
  const [supps] = usePersistentStore<{ name: string; dose: string; time_of_day: string }[]>('supplements', [])
  const topGoal = goals.find(g => g.priority && !g.done) || goals.find(g => !g.done)
  const medReminder = supps.find(s => s.name.toLowerCase().includes('concerta'))

  return (
    <PageShell topBar={<TopBar />}>
      {(topGoal || medReminder) && (
        <div className="card" style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          {topGoal && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Goal</span>
              <span style={{ fontSize: '0.85rem' }}>{topGoal.text}</span>
            </div>
          )}
          {medReminder && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Med</span>
              <span style={{ fontSize: '0.85rem' }}>{medReminder.name} · {medReminder.dose}</span>
            </div>
          )}
        </div>
      )}
      <DesktopGrid columns={3}>
        <DayProgressRing />
        <Goalmaxxing />
        <OverseerWidget />
      </DesktopGrid>
    </PageShell>
  )
}
