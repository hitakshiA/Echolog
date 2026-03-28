import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { sentimentVariant } from '../../components/ui/badge-variants'
import type { AnalysisResponse } from '../../types'

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null
}

const urgencyColors: Record<number, string> = {
  1: 'bg-slate-300',
  2: 'bg-blue-400',
  3: 'bg-amber-400',
  4: 'bg-orange-500',
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
      <Card className="flex flex-col items-center py-12 text-center">
        <div className="mb-3 text-4xl">🤖</div>
        <p className="text-sm font-medium text-text">No analysis yet</p>
        <p className="mt-1 text-xs text-text-muted">
          Click &quot;Analyze&quot; to get AI insights
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          Analysis Results
        </h3>
        {!analysis.is_valid && (
          <Badge variant="danger">Validation Issues</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="flex flex-col gap-2 rounded-xl bg-bg p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sentiment</span>
          <Badge variant={sentimentVariant(analysis.sentiment)} className="w-fit">
            {analysis.sentiment}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-bg p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Category</span>
          <Badge variant="default" className="w-fit">
            {categoryLabels[analysis.category] ?? analysis.category}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-bg p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Urgency</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-5 rounded-full ${
                    level <= analysis.urgency
                      ? urgencyColors[analysis.urgency]
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-text">{analysis.urgency}/5</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Themes</span>
        <div className="flex flex-wrap gap-2">
          {analysis.themes.map((theme, i) => (
            <Badge key={i} variant="info">
              {theme}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-accent-light p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Suggested Action</span>
        <p className="text-sm font-medium text-text">{analysis.suggested_action}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Summary</span>
        <p className="text-sm leading-relaxed text-text-secondary">{analysis.summary}</p>
      </div>

      {!analysis.is_valid && analysis.validation_errors && (
        <div className="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Validation Warnings</span>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-600">
            {analysis.validation_errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border-light pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Metadata</span>
        <div className="mt-2 grid grid-cols-4 gap-3">
          {[
            { label: 'Model', value: analysis.model },
            { label: 'Tokens', value: String(analysis.tokens_used) },
            { label: 'Latency', value: `${analysis.latency_ms}ms` },
            { label: 'Cost', value: `$${analysis.cost_cents.toFixed(4)}` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-bg px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{item.label}</div>
              <div className="text-xs font-medium text-text">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
