import { useParams, Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { statusVariant } from '../../components/ui/badge-variants'
import { useFeedbackDetail } from '../../api/feedback'
import { ActionBar } from './ActionBar'
import { NoteEditor } from './NoteEditor'
import { AnalysisPanel } from './AnalysisPanel'
import { AnalysisHistory } from './AnalysisHistory'

const sourceLabels: Record<string, string> = {
  app_review: 'App Review',
  support_ticket: 'Support Ticket',
  survey: 'Survey',
  slack: 'Slack',
  email: 'Email',
  other: 'Other',
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

export function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>()
  const feedbackId = Number(id)
  const { data: item, isLoading, error } = useFeedbackDetail(feedbackId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-40 animate-pulse rounded bg-slate-100" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-secondary">Feedback item not found</p>
        <Link to="/" className="text-accent hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="text-sm text-text-secondary hover:text-text no-underline"
        >
          Dashboard
        </Link>
        <span className="text-text-secondary">/</span>
        <span className="text-sm text-text">Feedback #{item.id}</span>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(item.status)}>
              {statusLabels[item.status] ?? item.status}
            </Badge>
            {item.source && (
              <Badge variant="neutral">
                {sourceLabels[item.source] ?? item.source}
              </Badge>
            )}
          </div>
          <div className="text-xs text-text-secondary">
            <span>Created: {new Date(item.created_at).toLocaleString()}</span>
            <span className="ml-4">
              Updated: {new Date(item.updated_at).toLocaleString()}
            </span>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm text-text">{item.content}</p>
      </Card>

      <ActionBar feedbackId={item.id} status={item.status} />

      <NoteEditor feedbackId={item.id} note={item.note} />

      <AnalysisPanel analysis={item.latest_analysis} />

      <AnalysisHistory feedbackId={item.id} />
    </div>
  )
}
