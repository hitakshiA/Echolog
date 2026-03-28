import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { sentimentVariant } from '../../components/ui/badge-variants'
import { useAnalysisHistory } from '../../api/analysis'
import type { AnalysisResponse } from '../../types'

interface AnalysisHistoryProps {
  feedbackId: number
}

function HistoryItem({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <div className="flex items-center gap-3">
        <Badge variant={sentimentVariant(analysis.sentiment)}>
          {analysis.sentiment}
        </Badge>
        <span className="text-xs text-text-secondary">
          Urgency: {analysis.urgency}/5
        </span>
        <span className="text-xs text-text-secondary">
          {analysis.model}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        {!analysis.is_valid && (
          <Badge variant="danger">Invalid</Badge>
        )}
        <span>{new Date(analysis.created_at).toLocaleString()}</span>
      </div>
    </div>
  )
}

export function AnalysisHistory({ feedbackId }: AnalysisHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: analyses } = useAnalysisHistory(feedbackId)

  if (!analyses || analyses.length <= 1) return null

  const previousAnalyses = analyses.slice(1)

  return (
    <Card className="flex flex-col gap-2">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="justify-start"
      >
        {isExpanded ? 'Hide' : 'Show'} Previous Analyses ({previousAnalyses.length})
      </Button>
      {isExpanded && (
        <div>
          {previousAnalyses.map((a) => (
            <HistoryItem key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </Card>
  )
}
