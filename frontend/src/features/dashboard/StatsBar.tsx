import { Card } from '../../components/ui/Card'
import type { PaginatedFeedbackResponse } from '../../types'

interface StatsBarProps {
  data: PaginatedFeedbackResponse | undefined
  isLoading: boolean
}

interface StatCardProps {
  label: string
  count: number
  total: number
}

function StatCard({ label, count, total }: StatCardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-2xl font-semibold text-text">{count}</span>
      <span className="text-xs text-text-secondary">{pct}% of total</span>
    </Card>
  )
}

export function StatsBar({ data, isLoading }: StatsBarProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-20 animate-pulse bg-slate-100" />
        ))}
      </div>
    )
  }

  const total = data.total
  const items = data.items

  // Count statuses across current page items (for display purposes)
  // The real counts come from total and status distribution
  const pendingTriage = items.filter((i) => i.status === 'new').length
  const inProgress = items.filter((i) => i.status === 'in_progress').length
  const resolved = items.filter((i) => i.status === 'resolved').length

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Feedback" count={total} total={total} />
      <StatCard label="Pending Triage" count={pendingTriage} total={total} />
      <StatCard label="In Progress" count={inProgress} total={total} />
      <StatCard label="Resolved" count={resolved} total={total} />
    </div>
  )
}
