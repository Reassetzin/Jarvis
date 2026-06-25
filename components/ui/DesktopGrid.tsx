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

  const items = (Array.isArray(children) ? children.flat() : [children]).filter(Boolean)

  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items}
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 16,
      alignItems: 'start',
    }}>
      {items}
    </div>
  )
}
