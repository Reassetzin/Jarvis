'use client'
import WeightTracker from '@/components/health/WeightTracker'
import WatchStats from '@/components/health/WatchStats'
import VitaminSchedule from '@/components/health/VitaminSchedule'
import CaloriesTracker from '@/components/health/CaloriesTracker'
import { WaterTracker, AnxietyTracker, WinsTracker } from '@/components/health/SimpleTrackers'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'

export default function HealthTab() {
  return (
    <PageShell>
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
