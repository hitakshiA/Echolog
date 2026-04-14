import type { PaginatedFeedbackResponse } from '../../types'

interface StatsBarProps {
  data: PaginatedFeedbackResponse | undefined
  isLoading: boolean
}

interface StatCardProps {
  label: string
  count: number
  accentColor: string
  dotColor: string
}

function StatCard({ label, count, accentColor, dotColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm shadow-black/[0.03]">
      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
      <div>
        <p className={`text-xl font-bold tracking-tight ${accentColor}`}>{count}</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
      </div>
    </div>
  )
}

export function StatsBar({ data, isLoading }: StatsBarProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-alt" />
        ))}
      </div>
    )
  }

  const total = data.total
  const items = data.items
  const pendingTriage = items.filter((i) => i.status === 'new').length
  const inProgress = items.filter((i) => i.status === 'in_progress').length
  const resolved = items.filter((i) => i.status === 'resolved').length

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total" count={total} accentColor="text-text" dotColor="bg-accent" />
      <StatCard label="Pending" count={pendingTriage} accentColor="text-orange" dotColor="bg-orange" />
      <StatCard label="In Progress" count={inProgress} accentColor="text-blue" dotColor="bg-blue" />
      <StatCard label="Resolved" count={resolved} accentColor="text-green" dotColor="bg-green" />
    </div>
  )
}
