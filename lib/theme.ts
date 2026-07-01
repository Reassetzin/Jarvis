'use client'

export interface Theme { id: string; name: string; accent: string; dim: string; rgb: string }

export const THEMES: Theme[] = [
  { id: 'amber', name: 'Amber', accent: '#F59E0B', dim: '#92400E', rgb: '245, 158, 11' },
  { id: 'blue', name: 'Ocean', accent: '#3B82F6', dim: '#1E3A8A', rgb: '59, 130, 246' },
  { id: 'green', name: 'Emerald', accent: '#22C55E', dim: '#166534', rgb: '34, 197, 94' },
  { id: 'purple', name: 'Violet', accent: '#8B5CF6', dim: '#5B21B6', rgb: '139, 92, 246' },
  { id: 'pink', name: 'Rose', accent: '#EC4899', dim: '#9D174D', rgb: '236, 72, 153' },
  { id: 'red', name: 'Crimson', accent: '#EF4444', dim: '#991B1B', rgb: '239, 68, 68' },
  { id: 'cyan', name: 'Cyan', accent: '#06B6D4', dim: '#155E75', rgb: '6, 182, 212' },
]

export function applyTheme(id: string) {
  const t = THEMES.find(x => x.id === id) || THEMES[0]
  const root = document.documentElement
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--accent-dim', t.dim)
  root.style.setProperty('--accent-rgb', t.rgb)
}

export function getSavedTheme(): string {
  try { return localStorage.getItem('los_p_theme') || 'amber' } catch { return 'amber' }
}

export function saveTheme(id: string) {
  try {
    localStorage.setItem('los_p_theme', id)
    import('./sync').then(m => m.pushState()).catch(() => {})
  } catch {}
  applyTheme(id)
}
