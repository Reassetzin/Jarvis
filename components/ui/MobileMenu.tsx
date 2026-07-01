'use client'
import { useState } from 'react'
import { Home, CalendarDays, TrendingUp, Star, Heart, Dumbbell, Gamepad2, Search, Menu, X } from 'lucide-react'
import { TabId } from './BottomNav'

const TABS: { id: TabId; label: string; Icon: React.ElementType; color: string }[] = [
  { id: 'main', label: 'Main', Icon: Home, color: 'var(--accent)' },
  { id: 'planner', label: 'Planner', Icon: CalendarDays, color: '#3B82F6' },
  { id: 'projects', label: 'Projects', Icon: Gamepad2, color: '#8B5CF6' },
  { id: 'finances', label: 'Finances', Icon: TrendingUp, color: '#22C55E' },
  { id: 'brand', label: 'Brand', Icon: Star, color: '#EAB308' },
  { id: 'health', label: 'Health', Icon: Heart, color: '#EF4444' },
  { id: 'gym', label: 'Activity', Icon: Dumbbell, color: '#EC4899' },
  { id: 'search', label: 'Search', Icon: Search, color: '#9CA3AF' },
]

export default function MobileMenu({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const [open, setOpen] = useState(false)
  const activeTab = TABS.find(t => t.id === active)

  return (
    <>
      {/* Floating menu button */}
      <button onClick={() => setOpen(true)} className="no-tap-highlight" style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 10px)', left: 12, zIndex: 250,
        display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(10,10,12,0.7)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 12px', cursor: 'pointer',
      }}>
        <Menu size={17} color={activeTab?.color || 'var(--accent)'} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F3F4F6' }}>{activeTab?.label}</span>
      </button>

      {/* Overlay + slide-out panel */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="overlay-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
          <div className="menu-panel" style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 250, maxWidth: '80vw', zIndex: 401,
            background: 'rgba(14,14,17,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column',
            paddingTop: 'calc(env(safe-area-inset-top) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 20px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em' }}>JARVIS</div>
                <div style={{ fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.1em' }}>LIFE OS</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}><X size={20} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', overflowY: 'auto' }}>
              {TABS.map(({ id, label, Icon, color }) => {
                const isActive = active === id
                return (
                  <button key={id} onClick={() => { onChange(id); setOpen(false) }} className="no-tap-highlight" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', borderRadius: 10,
                    background: isActive ? `${color}18` : 'transparent',
                    border: `1px solid ${isActive ? `${color}40` : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  }}>
                    <Icon size={19} color={isActive ? color : '#9CA3AF'} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#F3F4F6' : '#9CA3AF' }}>{label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
