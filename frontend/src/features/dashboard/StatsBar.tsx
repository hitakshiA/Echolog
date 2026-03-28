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
  icon: string
  color: string
}

function StatCard({ label, count, total, icon, color }: StatCardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color} text-lg`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text">{count}</span>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
      </div>
    </Card>
  )
}

export function StatsBar({ data, isLoading }: StatsBarProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-[88px] animate-pulse !bg-border-light" />
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
      <StatCard label="Total" count={total} total={total} icon="📋" color="bg-indigo-50" />
      <StatCard label="Pending" count={pendingTriage} total={total} icon="⏳" color="bg-amber-50" />
      <StatCard label="In Progress" count={inProgress} total={total} icon="🔄" color="bg-blue-50" />
      <StatCard label="Resolved" count={resolved} total={total} icon="✅" color="bg-emerald-50" />
    </div>
  )
}
