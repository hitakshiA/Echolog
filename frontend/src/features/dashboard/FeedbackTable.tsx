import { useNavigate } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { sentimentVariant, statusVariant } from '../../components/ui/badge-variants'
import type { FeedbackItem } from '../../types'

interface FeedbackTableProps {
  items: FeedbackItem[]
  isLoading: boolean
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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-alt" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.12" />
          <circle cx="24" cy="24" r="15" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="24" cy="24" r="8" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.35" />
          <circle cx="24" cy="24" r="3" fill="#7C3AED" fillOpacity="0.5" />
        </svg>
        <p className="text-sm font-semibold text-text">No feedback yet</p>
        <p className="mt-1 text-[13px] text-text-muted">Add your first piece of feedback to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-black/[0.03]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt/60">
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Content</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Source</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Sentiment</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Category</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Urgency</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Status</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={`cursor-pointer bg-surface transition-all duration-150 hover:bg-accent-light/40 ${idx < items.length - 1 ? 'border-b border-border-light' : ''}`}
              onClick={() => void navigate(`/feedback/${item.id}`)}
            >
              <td className="max-w-xs truncate px-5 py-4 font-medium text-text">
                {item.content.length > 80 ? `${item.content.slice(0, 80)}...` : item.content}
              </td>
              <td className="px-5 py-4 text-text-muted">
                {item.source ? sourceLabels[item.source] ?? item.source : '—'}
              </td>
              <td className="px-5 py-4">
                {item.latest_analysis ? (
                  <Badge variant={sentimentVariant(item.latest_analysis.sentiment)}>
                    {item.latest_analysis.sentiment}
                  </Badge>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                {item.latest_analysis ? (
                  <Badge variant="default">
                    {categoryLabels[item.latest_analysis.category] ?? item.latest_analysis.category}
                  </Badge>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                {item.latest_analysis ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 w-2 rounded-full ${
                          level <= item.latest_analysis!.urgency
                            ? level <= 2 ? 'bg-green' : level <= 3 ? 'bg-warning' : 'bg-danger'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <Badge variant={statusVariant(item.status)}>
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-text-muted">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
