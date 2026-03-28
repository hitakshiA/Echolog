import { z } from 'zod'

export const feedbackStatusEnum = z.enum([
  'new',
  'analyzing',
  'analyzed',
  'analysis_failed',
  'in_progress',
  'resolved',
  'dismissed',
])

export const feedbackSourceEnum = z.enum([
  'app_review',
  'support_ticket',
  'survey',
  'slack',
  'email',
  'other',
])

export const sentimentEnum = z.enum([
  'positive',
  'negative',
  'neutral',
  'mixed',
  'urgent',
])

export const analysisCategoryEnum = z.enum([
  'bug',
  'feature_request',
  'complaint',
  'praise',
  'question',
  'suggestion',
])

export const createFeedbackSchema = z.object({
  content: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(10000, 'Feedback must be under 10,000 characters'),
  source: feedbackSourceEnum.nullable().default(null),
})

export const updateStatusSchema = z.object({
  status: feedbackStatusEnum,
})

export const updateNoteSchema = z.object({
  note: z.string().max(2000, 'Note must be under 2,000 characters'),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type FeedbackStatus = z.infer<typeof feedbackStatusEnum>
export type FeedbackSource = z.infer<typeof feedbackSourceEnum>
export type Sentiment = z.infer<typeof sentimentEnum>
export type AnalysisCategory = z.infer<typeof analysisCategoryEnum>
