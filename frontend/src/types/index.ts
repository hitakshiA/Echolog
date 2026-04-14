import type { AnalysisResponse } from '../schemas/analysis'
import type {
  AnalysisCategory,
  FeedbackSource,
  FeedbackStatus,
  Sentiment,
} from '../schemas/feedback'

export interface FeedbackItem {
  id: number
  content: string
  source: FeedbackSource | null
  status: FeedbackStatus
  note: string | null
  latest_analysis: AnalysisResponse | null
  analysis_history?: AnalysisResponse[]
  created_at: string
  updated_at: string
}

export interface PaginatedFeedbackResponse {
  items: FeedbackItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface FeedbackFilters {
  status?: FeedbackStatus
  category?: AnalysisCategory
  sentiment?: Sentiment
  urgency_min?: number
  urgency_max?: number
  search?: string
  sort_by?: 'created_at' | 'urgency'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface AnalyticsSummary {
  total_feedback: number
  total_analyzed: number
  sentiment_distribution: Record<string, number>
  category_distribution: Record<string, number>
  average_urgency: number
  urgency_trend: Array<{ date: string; avg_urgency: number }>
  status_distribution: Record<string, number>
}

export type { AnalysisResponse, FeedbackStatus, FeedbackSource, Sentiment, AnalysisCategory }
