export type BadgeVariant =
  | 'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'

export function sentimentVariant(sentiment: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    positive: 'success',
    negative: 'danger',
    neutral: 'neutral',
    mixed: 'warning',
    urgent: 'danger',
  }
  return map[sentiment] ?? 'default'
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    new: 'info',
    analyzing: 'warning',
    analyzed: 'success',
    analysis_failed: 'danger',
    in_progress: 'info',
    resolved: 'success',
    dismissed: 'neutral',
  }
  return map[status] ?? 'default'
}
