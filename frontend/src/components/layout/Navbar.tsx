import { Link, useLocation } from 'react-router'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
            <span className="text-base font-bold text-white">E</span>
          </div>
          <span className="text-[17px] font-semibold text-text">EchoLog</span>
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? 'text-text'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] rounded-full bg-accent" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
