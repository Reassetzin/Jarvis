'use client'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  topBar?: ReactNode
}

export default function PageShell({ children, topBar }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {topBar}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '28px 32px 48px',
          width: '100%',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
