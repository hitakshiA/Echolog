import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { sentimentVariant } from '../../components/ui/badge-variants'
import type { AnalysisResponse } from '../../types'

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null
}

const urgencyColors: Record<number, string> = {
  1: 'bg-slate-200',
  2: 'bg-blue-300',
  3: 'bg-amber-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
}

const categoryLabels: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  complaint: 'Complaint',
  praise: 'Praise',
  question: 'Question',
  suggestion: 'Suggestion',
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card className="text-center text-sm text-text-secondary py-8">
        No analysis yet. Click &quot;Analyze&quot; to get AI insights.
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text">Analysis Results</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Sentiment</span>
          <Badge variant={sentimentVariant(analysis.sentiment)}>
            {analysis.sentiment}
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Category</span>
          <Badge variant="default">
            {categoryLabels[analysis.category] ?? analysis.category}
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Urgency</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${urgencyColors[analysis.urgency] ?? 'bg-slate-300'}`}
                style={{ width: `${(analysis.urgency / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text">{analysis.urgency}/5</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-secondary">Themes</span>
        <div className="flex flex-wrap gap-1">
          {analysis.themes.map((theme, i) => (
            <Badge key={i} variant="info">
              {theme}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-secondary">Suggested Action</span>
        <p className="text-sm text-text">{analysis.suggested_action}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-secondary">Summary</span>
        <p className="text-sm text-text">{analysis.summary}</p>
      </div>

      {!analysis.is_valid && analysis.validation_errors && (
        <div className="rounded-md bg-red-50 p-3">
          <span className="text-xs font-medium text-red-700">Validation Warnings</span>
          <ul className="mt-1 list-inside list-disc text-xs text-red-600">
            {analysis.validation_errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <span className="text-xs text-text-secondary">Metadata</span>
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-text-secondary">
          <span>Model: {analysis.model}</span>
          <span>Tokens: {analysis.tokens_used}</span>
          <span>Latency: {analysis.latency_ms}ms</span>
          <span>Cost: ${analysis.cost_cents.toFixed(2)}c</span>
        </div>
      </div>
    </Card>
  )
}
