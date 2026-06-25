'use client'
import { Home, TrendingUp, Star, Heart, Dumbbell, Search } from 'lucide-react'
import { TabId } from '@/components/ui/BottomNav'

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'main', label: 'Main', Icon: Home },
  { id: 'finances', label: 'Finances', Icon: TrendingUp },
  { id: 'brand', label: 'Brand', Icon: Star },
  { id: 'health', label: 'Health', Icon: Heart },
  { id: 'gym', label: 'Gym', Icon: Dumbbell },
  { id: 'search', label: 'Search', Icon: Search },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
  children: React.ReactNode
}

export default function DesktopLayout({ active, onChange, children }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1a1a1a', marginBottom: 16 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.02em' }}>JARVIS</div>
          <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 2, letterSpacing: '0.08em' }}>LIFE OS</div>
        </div>
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isActive ? '#1a0a00' : 'transparent',
                  border: `1px solid ${isActive ? '#92400E' : 'transparent'}`,
                  borderRadius: 6, padding: '10px 12px',
                  cursor: 'pointer', width: '100%',
                  color: isActive ? '#F59E0B' : '#4B5563',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#4B5563' }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>{label}</span>
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '0.6rem', color: '#1f1f1f', letterSpacing: '0.06em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
