'use client'
import { Home, CalendarDays, TrendingUp, Star, Heart, Dumbbell, Gamepad2, Search } from 'lucide-react'

export type TabId = 'main' | 'planner' | 'projects' | 'finances' | 'brand' | 'health' | 'gym' | 'search'

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'main', label: 'Main', Icon: Home },
  { id: 'planner', label: 'Planner', Icon: CalendarDays },
  { id: 'projects', label: 'Projects', Icon: Gamepad2 },
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
      width: '100%', maxWidth: 480, background: 'rgba(10,10,12,0.7)',
      borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', height: 56, zIndex: 100, backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      paddingBottom: 'env(safe-area-inset-bottom)', boxSizing: 'content-box',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button key={id} onClick={() => onChange(id)} className="no-tap-highlight" style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#F59E0B' : '#4B5563', transition: 'color 0.15s', position: 'relative', paddingTop: 2,
          }}>
            {isActive && <div style={{ position: 'absolute', top: 0, width: 24, height: 2, background: '#F59E0B', borderRadius: 2, boxShadow: '0 0 8px #F59E0B' }} />}
            <Icon size={isActive ? 18 : 16} strokeWidth={isActive ? 2.5 : 1.8} style={{ filter: isActive ? 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' : 'none', transition: 'all 0.15s' }} />
            <span style={{ fontSize: '0.48rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em' }}>{label.toUpperCase()}</span>
          </button>
        )
      })}
    </nav>
  )
}
