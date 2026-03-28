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
        <h1 className="text-2xl font-semibold text-text">Analytics</h1>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-72 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Analytics</h1>
        <p className="text-text-secondary">No analytics data available.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Analytics</h1>
        <p className="text-sm text-text-secondary">
          Overview of feedback analysis across {data.total_feedback} items ({data.total_analyzed} analyzed)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center gap-1 py-4">
          <span className="text-3xl font-bold text-text">{data.total_feedback}</span>
          <span className="text-xs text-text-secondary">Total Feedback</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-4">
          <span className="text-3xl font-bold text-text">{data.total_analyzed}</span>
          <span className="text-xs text-text-secondary">Analyzed</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-4">
          <span className="text-3xl font-bold text-accent">{data.average_urgency}</span>
          <span className="text-xs text-text-secondary">Avg Urgency</span>
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
