'use client'
import PeakWindowChart from '@/components/health/PeakWindowChart'
import SupplementTracker from '@/components/health/SupplementTracker'
import MedicationTracker from '@/components/health/MedicationTracker'
import WhoopSection from '@/components/health/WhoopSection'
import CaffeineTracker from '@/components/health/CaffeineTracker'
import { VeloTracker, WaterTracker, EnergyTracker, AnxietyTracker, WinsTracker, CaloriesTracker } from '@/components/health/SimpleTrackers'

export default function HealthTab() {
  return (
    <div className="tab-scroll-notop" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
    </div>
  )
}
