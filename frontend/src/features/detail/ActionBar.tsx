import { Button } from '../../components/ui/Button'
import { useUpdateStatus } from '../../api/feedback'
import { useAnalyzeFeedback } from '../../api/analysis'
import type { FeedbackStatus } from '../../types'

interface ActionBarProps {
  feedbackId: number
  status: FeedbackStatus
}

const VALID_TRANSITIONS: Record<string, { status: FeedbackStatus; label: string }[]> = {
  new: [{ status: 'analyzing', label: 'Analyze' }],
  analyzing: [],
  analyzed: [
    { status: 'in_progress', label: 'Start Working' },
    { status: 'resolved', label: 'Resolve' },
    { status: 'dismissed', label: 'Dismiss' },
  ],
  analysis_failed: [{ status: 'analyzing', label: 'Re-Analyze' }],
  in_progress: [
    { status: 'resolved', label: 'Resolve' },
    { status: 'dismissed', label: 'Dismiss' },
  ],
  resolved: [{ status: 'in_progress', label: 'Reopen' }],
  dismissed: [{ status: 'new', label: 'Reset to New' }],
}

export function ActionBar({ feedbackId, status }: ActionBarProps) {
  const updateStatus = useUpdateStatus(feedbackId)
  const analyzeFeedback = useAnalyzeFeedback(feedbackId)

  const transitions = VALID_TRANSITIONS[status] ?? []
  const canAnalyze = status === 'new' || status === 'analysis_failed'

  const handleAnalyze = () => {
    analyzeFeedback.mutate()
  }

  const handleTransition = (newStatus: FeedbackStatus) => {
    if (newStatus === 'analyzing') {
      handleAnalyze()
    } else {
      updateStatus.mutate({ status: newStatus })
    }
  }

  const isPending = updateStatus.isPending || analyzeFeedback.isPending

  return (
    <div className="flex flex-wrap gap-2">
      {canAnalyze && (
        <Button onClick={handleAnalyze} disabled={isPending}>
          {analyzeFeedback.isPending
            ? 'Analyzing...'
            : status === 'analysis_failed'
              ? 'Re-Analyze'
              : 'Analyze'}
        </Button>
      )}
      {transitions
        .filter((t) => t.status !== 'analyzing')
        .map((t) => (
          <Button
            key={t.status}
            variant={t.status === 'dismissed' ? 'ghost' : 'secondary'}
            onClick={() => handleTransition(t.status)}
            disabled={isPending}
          >
            {t.label}
          </Button>
        ))}
    </div>
  )
}
