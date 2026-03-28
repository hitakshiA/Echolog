import type { PaginatedFeedbackResponse } from '../../types'

interface StatsBarProps {
  data: PaginatedFeedbackResponse | undefined
  isLoading: boolean
}

interface StatCardProps {
  label: string
  count: number
  color: string
  borderColor: string
}

function StatCard({ label, count, color, borderColor }: StatCardProps) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-border bg-white p-5 ${borderColor}`} style={{ borderLeftWidth: '3px' }}>
      <div>
        <p className="text-sm text-text-muted">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{count}</p>
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
      <StatCard label="Total Feedback" count={total} color="text-text" borderColor="!border-l-violet-500" />
      <StatCard label="Pending Triage" count={pendingTriage} color="text-orange" borderColor="!border-l-orange" />
      <StatCard label="In Progress" count={inProgress} color="text-blue" borderColor="!border-l-blue" />
      <StatCard label="Resolved" count={resolved} color="text-green" borderColor="!border-l-green" />
    </div>
  )
}
