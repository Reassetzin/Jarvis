'use client'
import React from 'react'

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode; name?: string }, State> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error) { console.error('Caught error:', error) }
  reset = () => this.setState({ hasError: false, error: undefined })

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: 24, margin: 16 }}>
          <div style={{ fontSize: '0.9rem', color: '#EF4444', fontWeight: 700, marginBottom: 8 }}>Something glitched{this.props.name ? ` in ${this.props.name}` : ''}</div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 16 }}>This section hit an error but the rest of the app is fine.</p>
          <button onClick={this.reset} className="btn-amber" style={{ width: 'auto', padding: '8px 20px' }}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
