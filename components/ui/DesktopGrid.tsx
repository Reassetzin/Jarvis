'use client'
import { useEffect, useState, ReactNode } from 'react'

interface Props {
  children: ReactNode | ReactNode[]
  columns?: number
}

export default function DesktopGrid({ children, columns = 2 }: Props) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const items = (Array.isArray(children) ? (children as ReactNode[]).flat() : [children]).filter(Boolean)

  if (!isDesktop) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{items}</div>
  }

  // Masonry: distribute into columns top-to-bottom so cards pack tightly with no gaps
  const cols: ReactNode[][] = Array.from({ length: columns }, () => [])
  items.forEach((item, i) => cols[i % columns].push(item))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 16, alignItems: 'start' }}>
      {cols.map((col, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{col}</div>
      ))}
    </div>
  )
}
