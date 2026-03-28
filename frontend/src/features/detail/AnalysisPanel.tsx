import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { sentimentVariant } from '../../components/ui/badge-variants'
import type { AnalysisResponse } from '../../types'

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null
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
      <div className="rounded-2xl border-2 border-dashed border-border py-14 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-text">No analysis yet</p>
        <p className="mt-1 text-xs text-text-muted">Click &quot;Analyze&quot; to get AI insights</p>
      </div>
    )
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text">Analysis Results</h3>
        {!analysis.is_valid && <Badge variant="danger">Validation Issues</Badge>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface-alt p-4">
          <p className="mb-2 text-xs font-medium text-text-muted">Sentiment</p>
          <Badge variant={sentimentVariant(analysis.sentiment)}>{analysis.sentiment}</Badge>
        </div>
        <div className="rounded-xl bg-surface-alt p-4">
          <p className="mb-2 text-xs font-medium text-text-muted">Category</p>
          <Badge variant="default">{categoryLabels[analysis.category] ?? analysis.category}</Badge>
        </div>
        <div className="rounded-xl bg-surface-alt p-4">
          <p className="mb-2 text-xs font-medium text-text-muted">Urgency</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-5 rounded-full ${
                    level <= analysis.urgency
                      ? level <= 2 ? 'bg-green' : level <= 3 ? 'bg-warning' : 'bg-danger'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-text">{analysis.urgency}/5</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-text-muted">Themes</p>
        <div className="flex flex-wrap gap-2">
          {analysis.themes.map((theme, i) => (
            <Badge key={i} variant="info">{theme}</Badge>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-l-3 border-accent bg-accent-light p-4">
        <p className="mb-1 text-xs font-medium text-accent">Suggested Action</p>
        <p className="text-sm font-medium text-text">{analysis.suggested_action}</p>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">Summary</p>
        <p className="text-sm leading-relaxed text-text-secondary">{analysis.summary}</p>
      </div>

      {!analysis.is_valid && analysis.validation_errors && (
        <div className="rounded-xl bg-red-50 p-4">
          <p className="mb-2 text-xs font-medium text-red-700">Validation Warnings</p>
          <ul className="list-inside list-disc space-y-1 text-xs text-red-600">
            {analysis.validation_errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-medium text-text-muted">Metadata</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Model', value: analysis.model },
            { label: 'Tokens', value: String(analysis.tokens_used) },
            { label: 'Latency', value: `${analysis.latency_ms}ms` },
            { label: 'Cost', value: `$${analysis.cost_cents.toFixed(4)}` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-surface-alt px-3 py-2">
              <div className="text-[10px] font-medium text-text-muted">{item.label}</div>
              <div className="text-xs font-semibold text-text">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
