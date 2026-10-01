import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'

// Last-resort guard: if anything outside a tab crashes, show a reload prompt
// instead of a blank page.
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[RootErrorBoundary] App crashed:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1410', color: '#fcd34d', padding: 16, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong.</p>
          <p style={{ fontSize: 13, opacity: 0.8, wordBreak: 'break-word' }}>{String(this.state.error?.message || this.state.error)}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#d97706', color: '#000', border: 0, borderRadius: 6, fontWeight: 600 }}>
            Reload
          </button>
        </div>
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
