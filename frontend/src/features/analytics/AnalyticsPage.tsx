import { Card } from '../../components/ui/Card'
import { useAnalyticsSummary } from '../../api/analytics'
import { SentimentDonut } from './SentimentDonut'
import { CategoryBar } from './CategoryBar'
import { UrgencyTrend } from './UrgencyTrend'

export function AnalyticsPage() {
  const { data, isLoading } = useAnalyticsSummary()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[1.75rem] text-text" style={{ fontStyle: 'italic' }}>Analytics</h1>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse !bg-border-light" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="h-72 animate-pulse !bg-border-light" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[1.75rem] text-text" style={{ fontStyle: 'italic' }}>Analytics</h1>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 text-4xl">📊</div>
          <p className="text-sm text-text-muted">No analytics data available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.75rem] text-text" style={{ fontStyle: 'italic' }}>Analytics</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          Overview across {data.total_feedback} feedback items
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="text-3xl font-bold text-text">{data.total_feedback}</span>
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Total Feedback</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="text-3xl font-bold text-text">{data.total_analyzed}</span>
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Analyzed</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="text-3xl font-bold text-accent">{data.average_urgency}</span>
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Avg Urgency</span>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SentimentDonut data={data.sentiment_distribution} />
        <CategoryBar data={data.category_distribution} />
      </div>

      <UrgencyTrend data={data.urgency_trend} />
    </div>
  )
}
