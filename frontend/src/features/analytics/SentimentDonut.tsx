import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card } from '../../components/ui/Card'

interface SentimentDonutProps {
  data: Record<string, number>
}

const COLORS: Record<string, string> = {
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#64748B',
  mixed: '#F59E0B',
  urgent: '#DC2626',
}

export function SentimentDonut({ data }: SentimentDonutProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }))

  if (chartData.length === 0) {
    return (
      <Card className="flex items-center justify-center h-64 text-sm text-text-secondary">
        No sentiment data available
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] ?? '#94A3B8'}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
