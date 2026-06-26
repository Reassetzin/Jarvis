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
        <div className="page-shell-inner">
          {children}
        </div>
      </div>
    </div>
  )
}
