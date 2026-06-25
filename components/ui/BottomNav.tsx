'use client'
import { Home, CalendarDays, TrendingUp, Star, Heart, Dumbbell, Search } from 'lucide-react'

export type TabId = 'main' | 'planner' | 'finances' | 'brand' | 'health' | 'gym' | 'search'

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'main', label: 'Main', Icon: Home },
  { id: 'planner', label: 'Planner', Icon: CalendarDays },
  { id: 'finances', label: 'Finances', Icon: TrendingUp },
  { id: 'brand', label: 'Brand', Icon: Star },
  { id: 'health', label: 'Health', Icon: Heart },
  { id: 'gym', label: 'Activity', Icon: Dumbbell },
  { id: 'search', label: 'Search', Icon: Search },
]

interface Props { active: TabId; onChange: (tab: TabId) => void }

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, background: 'rgba(0,0,0,0.97)',
      borderTop: '1px solid #1f1f1f', display: 'flex', height: 56, zIndex: 100, backdropFilter: 'blur(12px)',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button key={id} onClick={() => onChange(id)} className="no-tap-highlight" style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#F59E0B' : '#4B5563', transition: 'color 0.15s',
          }}>
            <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.03em' }}>{label.toUpperCase()}</span>
          </button>
        )
      })}
    </nav>
  )
}
