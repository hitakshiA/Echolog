import { Link, useLocation } from 'react-router'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-500 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-text">
            EchoLog
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-bg p-1">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-1.5 text-sm font-medium no-underline transition-all duration-200 ${
                  isActive
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
