import { clsx, type ClassValue } from 'clsx'
export function cn(...inputs: ClassValue[]) { return clsx(inputs) }
export function getLocalDate(): string {
  const now = new Date()
  const hours = now.getHours()
  if (hours < 6) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
export function getDayLabel(): string {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return days[new Date().getDay()]
}
