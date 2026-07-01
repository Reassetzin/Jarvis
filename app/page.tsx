'use client'
import { useState } from 'react'
import BottomNav, { TabId } from '@/components/ui/BottomNav'
import DesktopLayout from '@/components/ui/DesktopLayout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import SyncProvider from '@/components/SyncProvider'
import MainTab from '@/components/tabs/MainTab'
import PlannerTab from '@/components/tabs/PlannerTab'
import ProjectsTab from '@/components/tabs/ProjectsTab'
import HealthTab from '@/components/tabs/HealthTab'
import BrandTab from '@/components/tabs/BrandTab'
import FinancesTab from '@/components/tabs/FinancesTab'
import GymTab from '@/components/tabs/GymTab'
import SearchTab from '@/components/tabs/SearchTab'

function TabContent({ active }: { active: TabId }) {
  return (
    <ErrorBoundary name={active} key={active}>
      <div className="page-enter" style={{ height: '100%' }}>
        {active === 'main' && <MainTab />}
        {active === 'planner' && <PlannerTab />}
        {active === 'projects' && <ProjectsTab />}
        {active === 'health' && <HealthTab />}
        {active === 'brand' && <BrandTab />}
        {active === 'finances' && <FinancesTab />}
        {active === 'gym' && <GymTab />}
        {active === 'search' && <SearchTab />}
      </div>
    </ErrorBoundary>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('main')
  return (
    <SyncProvider>
      <div className="mobile-layout" style={{ display: 'none' }}>
        <div style={{
          height: 'calc(100dvh - 56px - env(safe-area-inset-bottom))',
          paddingTop: 'env(safe-area-inset-top)',
          boxSizing: 'border-box',
        }}>
          <TabContent active={activeTab} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="desktop-layout" style={{ display: 'none' }}>
        <DesktopLayout active={activeTab} onChange={setActiveTab}>
          <TabContent active={activeTab} />
        </DesktopLayout>
      </div>
    </SyncProvider>
  )
}
