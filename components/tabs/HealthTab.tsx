'use client'
import EnergyChart from '@/components/health/EnergyChart'
import WatchStats from '@/components/health/WatchStats'
import VitaminSchedule from '@/components/health/VitaminSchedule'
import { WaterTracker, AnxietyTracker, WinsTracker, CaloriesTracker } from '@/components/health/SimpleTrackers'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'

export default function HealthTab() {
  return (
    <PageShell>
      <div style={{ marginBottom: 16 }}>
        <EnergyChart />
      </div>
      <DesktopGrid columns={2}>
        <VitaminSchedule />
        <WatchStats />
        <CaloriesTracker />
        <WinsTracker />
      </DesktopGrid>
      <div style={{ marginTop: 16 }}>
        <DesktopGrid columns={2}>
          <WaterTracker />
          <AnxietyTracker />
        </DesktopGrid>
      </div>
    </PageShell>
  )
}
