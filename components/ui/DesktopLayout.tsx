'use client'
import { Home, CalendarDays, TrendingUp, Star, Heart, Dumbbell, Gamepad2, Search, ListTodo } from 'lucide-react'
import { TabId } from '@/components/ui/BottomNav'

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'main', label: 'Main', Icon: Home },
  { id: 'planner', label: 'Planner', Icon: CalendarDays },
  { id: 'todos', label: 'To-Do', Icon: ListTodo },
  { id: 'projects', label: 'Projects', Icon: Gamepad2 },
  { id: 'finances', label: 'Finances', Icon: TrendingUp },
  { id: 'brand', label: 'Brand', Icon: Star },
  { id: 'health', label: 'Health', Icon: Heart },
  { id: 'gym', label: 'Activity', Icon: Dumbbell },
  { id: 'search', label: 'Search', Icon: Search },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
  children: React.ReactNode
}

export default function DesktopLayout({ active, onChange, children }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000', overflow: 'hidden' }}>
      {/* Fixed sidebar */}
      <aside style={{
        width: 200,
        minWidth: 200,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(12,12,14,0.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1a1a1a', marginBottom: 16 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>JARVIS</div>
          <div style={{ fontSize: '0.6rem', color: '#374151', marginTop: 2, letterSpacing: '0.1em' }}>LIFE OS</div>
        </div>
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => onChange(id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: isActive ? '#1a0a00' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-dim)' : 'transparent'}`,
                borderRadius: 6, padding: '10px 12px',
                cursor: 'pointer', width: '100%',
                color: isActive ? 'var(--accent)' : '#4B5563',
                transition: 'all 0.15s', textAlign: 'left',
              }}>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>{label}</span>
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '0.58rem', color: '#2a2a2a', letterSpacing: '0.06em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </aside>

      {/* Content area — takes all remaining width */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
