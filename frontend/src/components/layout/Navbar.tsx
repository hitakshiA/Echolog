import { Link, useLocation } from 'react-router'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-bold tracking-tight text-text no-underline">
          EchoLog
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
                className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text hover:bg-slate-100'
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
