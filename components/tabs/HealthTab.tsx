'use client'
import PeakWindowChart from '@/components/health/PeakWindowChart'
import SupplementTracker from '@/components/health/SupplementTracker'
import MedicationTracker from '@/components/health/MedicationTracker'
import WhoopSection from '@/components/health/WhoopSection'
import CaffeineTracker from '@/components/health/CaffeineTracker'
import { VeloTracker, WaterTracker, EnergyTracker, AnxietyTracker, WinsTracker, CaloriesTracker } from '@/components/health/SimpleTrackers'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'

export default function HealthTab() {
  return (
    <PageShell>
      {/* Full-width chart up top */}
      <div style={{ marginBottom: 16 }}>
        <PeakWindowChart />
      </div>
      {/* 2-col for main sections */}
      <DesktopGrid columns={2}>
        <WhoopSection />
        <MedicationTracker />
        <SupplementTracker />
        <CaffeineTracker />
      </DesktopGrid>
      {/* 3-col for small trackers */}
      <div style={{ marginTop: 16 }}>
        <DesktopGrid columns={3}>
          <VeloTracker />
          <WaterTracker />
          <CaloriesTracker />
          <EnergyTracker />
          <AnxietyTracker />
          <WinsTracker />
        </DesktopGrid>
      </div>
    </PageShell>
  )
}
