'use client'
import TopBar from '@/components/ui/TopBar'
import DayProgressRing from '@/components/main/DayProgressRing'
import Goalmaxxing from '@/components/main/Goalmaxxing'
import OverseerWidget from '@/components/main/OverseerWidget'
import DesktopGrid from '@/components/ui/DesktopGrid'
import PageShell from '@/components/ui/PageShell'
import { useDailyStore, usePersistentStore } from '@/hooks/useStore'
import { useMemo } from 'react'
import { Droplet, Pill, DollarSign, Activity, Zap } from 'lucide-react'

function thisMonth(dateStr: string) {
  const d = new Date(dateStr); const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export default function MainTab() {
  const [goals] = useDailyStore<{ text: string; done: boolean; priority: boolean; id: string }[]>('goals_today', [])
  const [water] = useDailyStore('water_count', 0)
  const [vits] = usePersistentStore<{ id: string }[]>('vitamins', [])
  const [vitsTaken] = useDailyStore<string[]>('vitamins_taken', [])
  const [txns] = usePersistentStore<{ type: string; amount: number; date: string }[]>('transactions', [])
  const [activity] = usePersistentStore<{ date: string; type: string }[]>('activity_history', [])
  const [brands] = usePersistentStore<{ accounts: { followers: number }[] }[]>('brands', [])
  const [activeBrandId] = usePersistentStore<string | null>('active_brand', null)

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

  const stats = [
    { icon: Zap, label: 'Goals', value: `${goalsDone}/${goals.length}`, color: '#F59E0B', done: goals.length > 0 && goalsDone === goals.length },
    { icon: Pill, label: 'Vitamins', value: `${vitsTakenCount}/${vits.length}`, color: '#22C55E', done: vits.length > 0 && vitsTakenCount === vits.length },
    { icon: Droplet, label: 'Water', value: `${water}/9`, color: '#3B82F6', done: water >= 9 },
    { icon: DollarSign, label: 'Net (mo)', value: `${net >= 0 ? '+' : ''}$${Math.abs(net).toLocaleString()}`, color: net >= 0 ? '#22C55E' : '#EF4444' },
    { icon: Activity, label: 'Activity (wk)', value: `${weekActivity}`, color: '#EC4899' },
    { icon: Zap, label: 'Reach', value: totalReach.toLocaleString(), color: '#8B5CF6' },
  ]

  return (
    <PageShell topBar={<TopBar />}>
      {/* At-a-glance stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card" style={{ padding: 12, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Icon size={12} color={s.color} />
                <span style={{ fontSize: '0.58rem', color: '#6B7280' }}>{s.label}</span>
                {s.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', marginLeft: 'auto' }} />}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {topGoal && (
        <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Goal</span>
          <span style={{ fontSize: '0.85rem' }}>{topGoal.text}</span>
        </div>
      )}

      <DesktopGrid columns={3}>
        <DayProgressRing />
        <Goalmaxxing />
        <OverseerWidget />
      </DesktopGrid>
    </PageShell>
  )
}
