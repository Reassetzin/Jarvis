'use client'
import { useState } from 'react'
import BottomNav, { TabId } from '@/components/ui/BottomNav'
import MainTab from '@/components/tabs/MainTab'
import HealthTab from '@/components/tabs/HealthTab'
import BrandTab from '@/components/tabs/BrandTab'
import FinancesTab from '@/components/tabs/FinancesTab'
import GymTab from '@/components/tabs/GymTab'
import SearchTab from '@/components/tabs/SearchTab'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('main')

  return (
    <>
      <div style={{ paddingBottom: 56 }}>
        {activeTab === 'main' && <MainTab />}
        {activeTab === 'health' && <HealthTab />}
        {activeTab === 'brand' && <BrandTab />}
        {activeTab === 'finances' && <FinancesTab />}
        {activeTab === 'gym' && <GymTab />}
        {activeTab === 'search' && <SearchTab />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )
}
