'use client'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  topBar?: ReactNode
}

export default function PageShell({ children, topBar }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {topBar}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
        <div style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '28px 40px 48px 40px',
          boxSizing: 'border-box',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
