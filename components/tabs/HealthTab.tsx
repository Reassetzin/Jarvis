'use client'
import PeakWindowChart from '@/components/health/PeakWindowChart'
import SupplementTracker from '@/components/health/SupplementTracker'
import MedicationTracker from '@/components/health/MedicationTracker'
import WhoopSection from '@/components/health/WhoopSection'
import CaffeineTracker from '@/components/health/CaffeineTracker'
import { VeloTracker, WaterTracker, EnergyTracker, AnxietyTracker, WinsTracker, CaloriesTracker } from '@/components/health/SimpleTrackers'
import DesktopGrid from '@/components/ui/DesktopGrid'

export default function HealthTab() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 32 }}>
      <DesktopGrid columns={3}>
        <PeakWindowChart />
        <WhoopSection />
        <MedicationTracker />
        <SupplementTracker />
        <CaffeineTracker />
        <VeloTracker />
        <WaterTracker />
        <EnergyTracker />
        <AnxietyTracker />
        <WinsTracker />
        <CaloriesTracker />
      </DesktopGrid>
    </div>
  )
}
