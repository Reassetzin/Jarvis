'use client'
import { useState } from 'react'
import BottomNav, { TabId } from '@/components/ui/BottomNav'
import DesktopLayout from '@/components/ui/DesktopLayout'
import MainTab from '@/components/tabs/MainTab'
import HealthTab from '@/components/tabs/HealthTab'
import BrandTab from '@/components/tabs/BrandTab'
import FinancesTab from '@/components/tabs/FinancesTab'
import GymTab from '@/components/tabs/GymTab'
import SearchTab from '@/components/tabs/SearchTab'

function TabContent({ active }: { active: TabId }) {
  return (
    <>
      {active === 'main' && <MainTab />}
      {active === 'health' && <HealthTab />}
      {active === 'brand' && <BrandTab />}
      {active === 'finances' && <FinancesTab />}
      {active === 'gym' && <GymTab />}
      {active === 'search' && <SearchTab />}
    </>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('main')

  return (
    <>
      {/* Mobile: bottom nav + full screen tabs */}
      <div className="mobile-layout" style={{ display: 'none' }}>
        <div style={{ paddingBottom: 56 }}>
          <TabContent active={activeTab} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Desktop: sidebar + content */}
      <div className="desktop-layout" style={{ display: 'none' }}>
        <DesktopLayout active={activeTab} onChange={setActiveTab}>
          <TabContent active={activeTab} />
        </DesktopLayout>
      </div>
    </>
  )
}
