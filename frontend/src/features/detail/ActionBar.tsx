import { Button } from '../../components/ui/Button'
import { useUpdateStatus } from '../../api/feedback'
import { useAnalyzeFeedback } from '../../api/analysis'
import { getApiKey } from '../../store'
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
  const hasApiKey = !!getApiKey()

  const errorMessage = analyzeFeedback.error
    ? (analyzeFeedback.error as Error).message || 'Analysis failed'
    : updateStatus.error
      ? (updateStatus.error as Error).message || 'Status update failed'
      : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {canAnalyze && !hasApiKey && (
          <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            Set your OpenAI API key first — click the key icon in the navbar.
          </p>
        )}
        {canAnalyze && (
          <Button onClick={handleAnalyze} disabled={isPending || !hasApiKey}>
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
      {errorMessage && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
