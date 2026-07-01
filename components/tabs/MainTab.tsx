'use client'
import TopBar from '@/components/ui/TopBar'
import DayProgressRing from '@/components/main/DayProgressRing'
import Goalmaxxing from '@/components/main/Goalmaxxing'
import OverseerWidget from '@/components/main/OverseerWidget'
import TodayPlanner from '@/components/main/TodayPlanner'
import { VitaminsMini, WaterMini } from '@/components/main/QuickGlance'
import { CashTrendChart, WeightTrendChart } from '@/components/main/DashboardCharts'
import ProjectsMini from '@/components/main/ProjectsMini'
import StreaksWidget from '@/components/main/StreaksWidget'
import WeeklyReview from '@/components/main/WeeklyReview'
import MonthlyReview from '@/components/main/MonthlyReview'
import NotificationSettings from '@/components/main/NotificationSettings'
import ThemePicker from '@/components/main/ThemePicker'
import UpcomingEvents from '@/components/main/UpcomingEvents'
import Heatmap from '@/components/ui/Heatmap'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useMemo, useState } from 'react'
import { Droplet, Pill, DollarSign, Activity, Zap, CalendarDays, SlidersHorizontal, Eye, EyeOff, ChevronUp, ChevronDown, X } from 'lucide-react'

function thisMonth(dateStr: string) {
  const d = new Date(dateStr); const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}
function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

// Passthrough so masonry counts each widget as one grid item
function WidgetWrap({ children }: { children: React.ReactNode }) { return <>{children}</> }

export default function MainTab() {
  const [goals] = useDailyStore<{ text: string; done: boolean; priority: boolean; id: string }[]>('goals_today', [])
  const [water] = useDailyStore('water_ml', 0)
  const [waterGoal] = usePersistentStore('water_goal_ml', 3000)
  const [vits] = usePersistentStore<{ id: string }[]>('vitamins', [])
  const [vitsTaken] = useDailyStore<string[]>('vitamins_taken', [])
  const [txns] = usePersistentStore<{ type: string; amount: number; date: string }[]>('transactions', [])
  const [activity] = usePersistentStore<{ date: string; type: string }[]>('activity_history', [])
  const [brands] = usePersistentStore<{ accounts: { followers: number }[] }[]>('brands', [])
  const [tasks] = usePersistentStore<{ date: string; done: boolean }[]>('planner_tasks', [])

  const goalsDone = goals.filter(g => g.done).length
  const topGoal = goals.find(g => g.priority && !g.done) || goals.find(g => !g.done)

  const monthTxns = useMemo(() => txns.filter(t => thisMonth(t.date)), [txns])
  const income = monthTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const net = income - expenses

  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const weekActivity = activity.filter(s => new Date(s.date + ', ' + now.getFullYear()) >= weekStart).length
  const totalReach = brands.reduce((a, b) => a + (b.accounts?.reduce((s, x) => s + x.followers, 0) || 0), 0)
  const vitsTakenCount = vitsTaken.filter(id => vits.some(v => v.id === id)).length

  const today = ymd(new Date())
  const todayTasks = tasks.filter(t => t.date === today)
  const tasksDone = todayTasks.filter(t => t.done).length

  const activityHeatmap: Record<string, number> = {}
  activity.forEach(s => {
    const d = new Date(s.date)
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      activityHeatmap[key] = (activityHeatmap[key] || 0) + 1
    }
  })

  // ── Widget registry ──
  const WIDGETS: { id: string; name: string; node: React.ReactNode }[] = [
    { id: 'dayProgress', name: 'Day Progress', node: <DayProgressRing /> },
    { id: 'goalmaxxing', name: 'Goalmaxxing', node: <Goalmaxxing /> },
    { id: 'todayPlanner', name: 'Today Planner', node: <TodayPlanner /> },
    { id: 'upcomingEvents', name: 'Upcoming Events', node: <UpcomingEvents /> },
    { id: 'cashTrend', name: 'Cash Trend', node: <CashTrendChart /> },
    { id: 'weeklyReview', name: 'Weekly Review', node: <WeeklyReview /> },
    { id: 'monthlyReview', name: 'Monthly Review', node: <MonthlyReview /> },
    { id: 'weightTrend', name: 'Weight Trend', node: <WeightTrendChart /> },
    { id: 'vitaminsMini', name: 'Vitamins', node: <VitaminsMini /> },
    { id: 'streaks', name: 'Streaks', node: <StreaksWidget /> },
    { id: 'projectsMini', name: 'Projects', node: <ProjectsMini /> },
    { id: 'activityHeatmap', name: 'Activity Heatmap', node: <div className="card"><Heatmap data={activityHeatmap} color="#EC4899" title="Activity · 12 Weeks" weeks={12} /></div> },
    { id: 'waterMini', name: 'Water', node: <WaterMini /> },
    { id: 'notifications', name: 'Reminders', node: <NotificationSettings /> },
    { id: 'theme', name: 'Theme', node: <ThemePicker /> },
    { id: 'overseer', name: 'Overseer AI', node: <OverseerWidget /> },
  ]
  const DEFAULT_ORDER = WIDGETS.map(w => w.id)

  const [order, setOrder] = usePersistentStore<string[]>('dash_order', DEFAULT_ORDER)
  const [hidden, setHidden] = usePersistentStore<string[]>('dash_hidden', [])
  const [customizing, setCustomizing] = useState(false)

  // Merge: keep saved order, append any new widgets not yet in it
  const orderedIds = useMemo(() => {
    const known = new Set(DEFAULT_ORDER)
    const valid = order.filter(id => known.has(id))
    const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
    return [...valid, ...missing]
  }, [order])

  function toggleHidden(id: string) { setHidden(h => h.includes(id) ? h.filter(x => x !== id) : [...h, id]) }
  function move(id: string, dir: -1 | 1) {
    setOrder(() => {
      const arr = [...orderedIds]
      const i = arr.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }
  function resetDash() { setOrder(DEFAULT_ORDER); setHidden([]) }

  const visibleWidgets = orderedIds.filter(id => !hidden.includes(id)).map(id => WIDGETS.find(w => w.id === id)!).filter(Boolean)

  const stats = [
    { icon: Zap, label: 'Goals', value: `${goalsDone}/${goals.length}`, color: 'var(--accent)', done: goals.length > 0 && goalsDone === goals.length },
    { icon: CalendarDays, label: 'Tasks', value: `${tasksDone}/${todayTasks.length}`, color: '#3B82F6', done: todayTasks.length > 0 && tasksDone === todayTasks.length },
    { icon: Pill, label: 'Vitamins', value: `${vitsTakenCount}/${vits.length}`, color: '#22C55E', done: vits.length > 0 && vitsTakenCount === vits.length },
    { icon: Droplet, label: 'Water', value: `${(water / 1000).toFixed(1)}L`, color: '#3B82F6', done: water >= waterGoal },
    { icon: DollarSign, label: 'Net (mo)', value: `${net >= 0 ? '+' : ''}$${Math.abs(net).toLocaleString()}`, color: net >= 0 ? '#22C55E' : '#EF4444' },
    { icon: Activity, label: 'Activity (wk)', value: `${weekActivity}`, color: '#EC4899' },
  ]

  return (
    <PageShell topBar={<TopBar />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card" style={{ padding: 12, boxShadow: `0 0 20px ${s.color}18, 0 4px 24px rgba(0,0,0,0.4)`, borderColor: `${s.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Icon size={12} color={s.color} />
                <span style={{ fontSize: '0.58rem', color: '#6B7280' }}>{s.label}</span>
                {s.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', marginLeft: 'auto', boxShadow: '0 0 6px #22C55E' }} />}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {topGoal && (
        <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Goal</span>
          <span style={{ fontSize: '0.85rem' }}>{topGoal.text}</span>
        </div>
      )}

      {/* Customize toggle */}
      {customizing && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Dashboard Widgets</div>
            <button onClick={resetDash} className="btn-ghost" style={{ fontSize: '0.68rem' }}>Reset</button>
          </div>
          <p style={{ fontSize: '0.62rem', color: '#6B7280', marginBottom: 12, lineHeight: 1.4 }}>Toggle visibility with the eye, reorder with the arrows. Changes sync across your devices.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {orderedIds.map((id, idx) => {
              const w = WIDGETS.find(x => x.id === id)
              if (!w) return null
              const isHidden = hidden.includes(id)
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #222', borderRadius: 8, padding: '8px 10px', opacity: isHidden ? 0.5 : 1 }}>
                  <button onClick={() => toggleHidden(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isHidden ? '#6B7280' : 'var(--accent)', display: 'flex', flexShrink: 0 }}>
                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <span style={{ flex: 1, fontSize: '0.8rem', color: isHidden ? '#6B7280' : '#E5E7EB', textDecoration: isHidden ? 'line-through' : 'none' }}>{w.name}</span>
                  <button onClick={() => move(id, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#2a2a2a' : '#9CA3AF', display: 'flex', padding: 2 }}><ChevronUp size={16} /></button>
                  <button onClick={() => move(id, 1)} disabled={idx === orderedIds.length - 1} style={{ background: 'none', border: 'none', cursor: idx === orderedIds.length - 1 ? 'default' : 'pointer', color: idx === orderedIds.length - 1 ? '#2a2a2a' : '#9CA3AF', display: 'flex', padding: 2 }}><ChevronDown size={16} /></button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!customizing && (
        <DesktopGrid columns={3}>
          {visibleWidgets.map(w => <WidgetWrap key={w.id}>{w.node}</WidgetWrap>)}
        </DesktopGrid>
      )}

      {/* Customize toggle — bottom of page */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button onClick={() => setCustomizing(c => !c)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: customizing ? 'var(--accent)' : '#181818',
          color: customizing ? '#000' : '#9CA3AF', border: `1px solid ${customizing ? 'var(--accent)' : '#333'}`,
          borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
        }}>
          <SlidersHorizontal size={14} /> {customizing ? 'Done Customizing' : 'Customize Dashboard'}
        </button>
      </div>
    </PageShell>
  )
}
