import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card } from '../../components/ui/Card'

interface UrgencyTrendProps {
  data: Array<{ date: string; avg_urgency: number }>
}

export function UrgencyTrend({ data }: UrgencyTrendProps) {
  if (data.length === 0) {
    return (
      <Card className="flex items-center justify-center h-64 text-sm text-text-secondary">
        No urgency trend data available
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Urgency Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="avg_urgency"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
