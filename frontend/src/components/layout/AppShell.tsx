import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
    </div>
  )
}
