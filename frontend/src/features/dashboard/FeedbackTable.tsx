import { useNavigate } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { sentimentVariant, statusVariant } from '../../components/ui/badge-variants'
import type { FeedbackItem } from '../../types'

interface FeedbackTableProps {
  items: FeedbackItem[]
  isLoading: boolean
}

const urgencyColor: Record<number, string> = {
  1: 'text-slate-500',
  2: 'text-blue-500',
  3: 'text-amber-500',
  4: 'text-orange-500',
  5: 'text-red-600 font-bold',
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
        No feedback items found. Add some feedback to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Content</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Source</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Sentiment</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Category</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Urgency</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => void navigate(`/feedback/${item.id}`)}
            >
              <td className="max-w-xs truncate px-4 py-3 text-text">
                {item.content.length > 100
                  ? `${item.content.slice(0, 100)}...`
                  : item.content}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {item.source ? sourceLabels[item.source] ?? item.source : '—'}
              </td>
              <td className="px-4 py-3">
                {item.latest_analysis ? (
                  <Badge variant={sentimentVariant(item.latest_analysis.sentiment)}>
                    {item.latest_analysis.sentiment}
                  </Badge>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {item.latest_analysis ? (
                  <Badge variant="default">
                    {categoryLabels[item.latest_analysis.category] ??
                      item.latest_analysis.category}
                  </Badge>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {item.latest_analysis ? (
                  <span className={urgencyColor[item.latest_analysis.urgency] ?? ''}>
                    {item.latest_analysis.urgency}
                  </span>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(item.status)}>
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
