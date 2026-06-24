'use client'
import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import MainTab from '@/components/tabs/MainTab'
import HealthTab from '@/components/tabs/HealthTab'
import BrandTab from '@/components/tabs/BrandTab'
import FinancesTab from '@/components/tabs/FinancesTab'
import GymTab from '@/components/tabs/GymTab'
import SearchTab from '@/components/tabs/SearchTab'

type Tab = 'main' | 'finances' | 'brand' | 'health' | 'gym' | 'search'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('main')
  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[430px] relative min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'main' && <MainTab />}
          {activeTab === 'finances' && <FinancesTab />}
          {activeTab === 'brand' && <BrandTab />}
          {activeTab === 'health' && <HealthTab />}
          {activeTab === 'gym' && <GymTab />}
          {activeTab === 'search' && <SearchTab />}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
