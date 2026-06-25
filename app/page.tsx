'use client'
import { useState } from 'react'
import BottomNav, { TabId } from '@/components/ui/BottomNav'
import DesktopLayout from '@/components/ui/DesktopLayout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import MainTab from '@/components/tabs/MainTab'
import PlannerTab from '@/components/tabs/PlannerTab'
import HealthTab from '@/components/tabs/HealthTab'
import BrandTab from '@/components/tabs/BrandTab'
import FinancesTab from '@/components/tabs/FinancesTab'
import GymTab from '@/components/tabs/GymTab'
import SearchTab from '@/components/tabs/SearchTab'

function TabContent({ active }: { active: TabId }) {
  return (
    <ErrorBoundary name={active} key={active}>
      {active === 'main' && <MainTab />}
      {active === 'planner' && <PlannerTab />}
      {active === 'health' && <HealthTab />}
      {active === 'brand' && <BrandTab />}
      {active === 'finances' && <FinancesTab />}
      {active === 'gym' && <GymTab />}
      {active === 'search' && <SearchTab />}
    </ErrorBoundary>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('main')
  return (
    <>
      <div className="mobile-layout" style={{ display: 'none' }}>
        <div style={{ paddingBottom: 56 }}>
          <TabContent active={activeTab} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="desktop-layout" style={{ display: 'none' }}>
        <DesktopLayout active={activeTab} onChange={setActiveTab}>
          <TabContent active={activeTab} />
        </DesktopLayout>
      </div>
    </>
  )
}
