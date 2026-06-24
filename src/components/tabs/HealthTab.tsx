import WhoopSection from '@/components/health/WhoopSection'
import SupplementTracker from '@/components/health/SupplementTracker'
import MedicationTracker from '@/components/health/MedicationTracker'
import VeloTracker from '@/components/health/VeloTracker'
import CaffeineTracker from '@/components/health/CaffeineTracker'
import EnergyTracker from '@/components/health/EnergyTracker'
import AnxietyTracker from '@/components/health/AnxietyTracker'
import WaterTracker from '@/components/health/WaterTracker'
import WinsTracker from '@/components/health/WinsTracker'
import CalorieTracker from '@/components/health/CalorieTracker'

export default function HealthTab() {
  return (
    <div className="p-4 space-y-4">
      <WhoopSection />
      <MedicationTracker />
      <WaterTracker />
      <EnergyTracker />
      <AnxietyTracker />
      <VeloTracker />
      <CaffeineTracker />
      <SupplementTracker />
      <CalorieTracker />
      <WinsTracker />
    </div>
  )
}
