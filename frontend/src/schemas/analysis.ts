import { z } from 'zod'
import { analysisCategoryEnum, sentimentEnum } from './feedback'

export const analysisResponseSchema = z.object({
  id: z.number(),
  sentiment: sentimentEnum,
  category: analysisCategoryEnum,
  urgency: z.number().min(1).max(5),
  themes: z.array(z.string()),
  suggested_action: z.string(),
  summary: z.string(),
  model: z.string(),
  tokens_used: z.number(),
  latency_ms: z.number(),
  cost_cents: z.number(),
  is_valid: z.boolean(),
  validation_errors: z.array(z.string()).nullable(),
  created_at: z.string(),
})

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>
