import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card } from '../../components/ui/Card'

interface CategoryBarProps {
  data: Record<string, number>
}

const categoryLabels: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature',
  complaint: 'Complaint',
  praise: 'Praise',
  question: 'Question',
  suggestion: 'Suggestion',
}

export function CategoryBar({ data }: CategoryBarProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: categoryLabels[name] ?? name,
    count: value,
  }))

  if (chartData.length === 0) {
    return (
      <Card className="flex items-center justify-center h-64 text-sm text-text-secondary">
        No category data available
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
