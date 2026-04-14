import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { getApiKey, setApiKey } from '../../store'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
]

function EchoLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      {/* Overlapping sound-wave / echo rings */}
      <circle cx="16" cy="16" r="14" stroke="#7C3AED" strokeWidth="2.2" strokeOpacity="0.15" />
      <circle cx="16" cy="16" r="9.5" stroke="#7C3AED" strokeWidth="2.2" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="5" fill="#7C3AED" />
      {/* Inner highlight dot */}
      <circle cx="14.5" cy="14.5" r="1.5" fill="white" fillOpacity="0.5" />
    </svg>
  )
}

export function Navbar() {
  const location = useLocation()
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyValue, setKeyValue] = useState('')

  const hasKey = !!getApiKey()

  const handleOpen = () => {
    setKeyValue(getApiKey() ?? '')
    setShowKeyModal(true)
  }

  const handleSave = () => {
    setApiKey(keyValue.trim())
    setShowKeyModal(false)
  }

  return (
    <>
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <EchoLogo />
            <span className="font-display text-xl text-text" style={{ fontStyle: 'italic' }}>EchoLog</span>
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-light text-accent'
                      : 'text-text-muted hover:bg-surface-alt hover:text-text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mx-2 h-5 w-px bg-border" />
            <button
              onClick={handleOpen}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-surface-alt ${hasKey ? 'text-green' : 'text-warning'}`}
              title={hasKey ? 'API key configured' : 'Set OpenAI API key'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {showKeyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowKeyModal(false) }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl text-text" style={{ fontStyle: 'italic' }}>API Key</h2>
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-text-muted">
              Stored in your browser's localStorage. Sent only to OpenAI's API &mdash; never to our servers.
            </p>
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-..."
              className="mb-4 h-[38px] w-full rounded-lg border border-border bg-bg px-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98]"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
