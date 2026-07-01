'use client'
import WeightTracker from '@/components/health/WeightTracker'
import WatchStats from '@/components/health/WatchStats'
import VitaminSchedule from '@/components/health/VitaminSchedule'
import CaloriesTracker from '@/components/health/CaloriesTracker'
import { WaterTracker, AnxietyTracker, WinsTracker } from '@/components/health/SimpleTrackers'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import Heatmap from '@/components/ui/Heatmap'
import { usePersistentStore } from '@/hooks/useStore'

export default function HealthTab() {
  const [weightLog] = usePersistentStore<{ date: string; weight: number }[]>('weight_log', [])
  const weighInData: Record<string, number> = {}
  weightLog.forEach(e => { weighInData[e.date] = 1 })

  return (
    <PageShell>
      <div className="card" style={{ marginBottom: 16 }}>
        <Heatmap data={weighInData} color="var(--accent)" title="Weigh-in Consistency · Last 17 Weeks" weeks={17} maxValue={1} />
      </div>
      <DesktopGrid columns={2}>
        <WeightTracker />
        <VitaminSchedule />
        <CaloriesTracker />
        <WatchStats />
        <WaterTracker />
        <AnxietyTracker />
        <WinsTracker />
      </DesktopGrid>
    </PageShell>
  )
}
