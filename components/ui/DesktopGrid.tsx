'use client'
import { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode[]
  columns?: number // how many columns on desktop (default 3)
}

// Splits children into columns in a masonry-like order
function distributeChildren(children: React.ReactNode[], cols: number) {
  const columns: React.ReactNode[][] = Array.from({ length: cols }, () => [])
  children.forEach((child, i) => columns[i % cols].push(child))
  return columns
}

export default function DesktopGrid({ children, columns = 3 }: Props) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const items = Array.isArray(children) ? children.flat() : [children]

  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items}
      </div>
    )
  }

  const cols = distributeChildren(items, columns)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 16,
      alignItems: 'start',
    }}>
      {cols.map((col, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {col}
        </div>
      ))}
    </div>
  )
}
