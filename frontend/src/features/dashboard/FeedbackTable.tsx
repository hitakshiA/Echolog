import { useNavigate } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { sentimentVariant, statusVariant } from '../../components/ui/badge-variants'
import type { FeedbackItem } from '../../types'

interface FeedbackTableProps {
  items: FeedbackItem[]
  isLoading: boolean
}

const urgencyColors: Record<number, string> = {
  1: 'bg-slate-300',
  2: 'bg-blue-400',
  3: 'bg-amber-400',
  4: 'bg-orange-500',
  5: 'bg-red-500',
}

const sourceLabels: Record<string, string> = {
  app_review: 'App Review',
  support_ticket: 'Support',
  survey: 'Survey',
  slack: 'Slack',
  email: 'Email',
  other: 'Other',
}

const categoryLabels: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature',
  complaint: 'Complaint',
  praise: 'Praise',
  question: 'Question',
  suggestion: 'Suggestion',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  analyzing: 'Analyzing',
  analyzed: 'Analyzed',
  analysis_failed: 'Failed',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

export function FeedbackTable({ items, isLoading }: FeedbackTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-border-light" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
        <div className="mb-3 text-4xl">💬</div>
        <p className="text-sm font-medium text-text">No feedback items found</p>
        <p className="mt-1 text-xs text-text-muted">Add some feedback to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Content</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Source</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Sentiment</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Category</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Urgency</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={`cursor-pointer transition-colors hover:bg-surface-hover ${idx < items.length - 1 ? 'border-b border-border-light' : ''}`}
              onClick={() => void navigate(`/feedback/${item.id}`)}
            >
              <td className="max-w-xs truncate px-5 py-3.5 font-medium text-text">
                {item.content.length > 80
                  ? `${item.content.slice(0, 80)}...`
                  : item.content}
              </td>
              <td className="px-5 py-3.5 text-text-secondary">
                {item.source ? sourceLabels[item.source] ?? item.source : '—'}
              </td>
              <td className="px-5 py-3.5">
                {item.latest_analysis ? (
                  <Badge variant={sentimentVariant(item.latest_analysis.sentiment)}>
                    {item.latest_analysis.sentiment}
                  </Badge>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                {item.latest_analysis ? (
                  <Badge variant="default">
                    {categoryLabels[item.latest_analysis.category] ?? item.latest_analysis.category}
                  </Badge>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                {item.latest_analysis ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 w-3 rounded-full ${
                            level <= item.latest_analysis!.urgency
                              ? urgencyColors[item.latest_analysis!.urgency]
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={statusVariant(item.status)}>
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-text-muted">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
