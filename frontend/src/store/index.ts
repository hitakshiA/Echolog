import type { FeedbackItem, AnalysisResponse, FeedbackFilters, PaginatedFeedbackResponse, AnalyticsSummary } from '../types'
import type { FeedbackStatus, FeedbackSource } from '../schemas/feedback'

const STORAGE_KEY = 'echolog_feedback'
const API_KEY_STORAGE_KEY = 'echolog_openai_api_key'

// --- API Key ---

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY || null
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key)
}

// --- State machine ---

const VALID_TRANSITIONS: Record<string, FeedbackStatus[]> = {
  new: ['analyzing'],
  analyzing: ['analyzed', 'analysis_failed'],
  analyzed: ['in_progress', 'resolved', 'dismissed'],
  analysis_failed: ['analyzing'],
  in_progress: ['resolved', 'dismissed'],
  resolved: ['in_progress'],
  dismissed: ['new'],
}

export function isValidTransition(current: FeedbackStatus, requested: FeedbackStatus): boolean {
  return (VALID_TRANSITIONS[current] ?? []).includes(requested)
}

// --- Persistence helpers ---

function loadItems(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveItems(items: FeedbackItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

let nextId = 0
function getNextId(): number {
  const items = loadItems()
  const maxId = items.reduce((max, item) => Math.max(max, item.id), 0)
  nextId = Math.max(nextId, maxId) + 1
  return nextId
}

let nextAnalysisId = 0
function getNextAnalysisId(): number {
  const items = loadItems()
  let maxId = 0
  for (const item of items) {
    if (item.latest_analysis && item.latest_analysis.id > maxId) maxId = item.latest_analysis.id
    if (item.analysis_history) {
      for (const a of item.analysis_history) {
        if (a.id > maxId) maxId = a.id
      }
    }
  }
  nextAnalysisId = Math.max(nextAnalysisId, maxId) + 1
  return nextAnalysisId
}

// --- CRUD ---

export function createFeedback(content: string, source: FeedbackSource | null): FeedbackItem {
  const now = new Date().toISOString()
  const item: FeedbackItem = {
    id: getNextId(),
    content,
    source,
    status: 'new',
    note: null,
    latest_analysis: null,
    analysis_history: [],
    created_at: now,
    updated_at: now,
  }
  const items = loadItems()
  items.unshift(item)
  saveItems(items)
  return item
}

export function getFeedback(id: number): FeedbackItem | null {
  return loadItems().find((i) => i.id === id) ?? null
}

export function deleteFeedback(id: number): void {
  saveItems(loadItems().filter((i) => i.id !== id))
}

export function updateStatus(id: number, status: FeedbackStatus): FeedbackItem {
  const items = loadItems()
  const item = items.find((i) => i.id === id)
  if (!item) throw new Error(`Feedback item ${id} not found`)
  if (!isValidTransition(item.status as FeedbackStatus, status)) {
    throw new Error(`Cannot transition from ${item.status} to ${status}`)
  }
  item.status = status
  item.updated_at = new Date().toISOString()
  saveItems(items)
  return item
}

export function updateNote(id: number, note: string): FeedbackItem {
  const items = loadItems()
  const item = items.find((i) => i.id === id)
  if (!item) throw new Error(`Feedback item ${id} not found`)
  item.note = note
  item.updated_at = new Date().toISOString()
  saveItems(items)
  return item
}

export function saveAnalysis(feedbackId: number, analysis: AnalysisResponse, newStatus: FeedbackStatus): FeedbackItem {
  const items = loadItems()
  const item = items.find((i) => i.id === feedbackId)
  if (!item) throw new Error(`Feedback item ${feedbackId} not found`)

  if (!item.analysis_history) item.analysis_history = []
  if (item.latest_analysis) {
    item.analysis_history.unshift(item.latest_analysis)
  }
  item.latest_analysis = analysis
  item.status = newStatus
  item.updated_at = new Date().toISOString()
  saveItems(items)
  return item
}

// --- List with filtering/sorting/pagination ---

export function listFeedback(filters: FeedbackFilters): PaginatedFeedbackResponse {
  let items = loadItems()

  if (filters.status) {
    items = items.filter((i) => i.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    items = items.filter((i) => i.content.toLowerCase().includes(q))
  }
  if (filters.category) {
    items = items.filter((i) => i.latest_analysis?.category === filters.category)
  }
  if (filters.sentiment) {
    items = items.filter((i) => i.latest_analysis?.sentiment === filters.sentiment)
  }
  if (filters.urgency_min !== undefined && filters.urgency_min > 1) {
    items = items.filter((i) => i.latest_analysis && i.latest_analysis.urgency >= filters.urgency_min!)
  }
  if (filters.urgency_max !== undefined && filters.urgency_max < 5) {
    items = items.filter((i) => i.latest_analysis && i.latest_analysis.urgency <= filters.urgency_max!)
  }

  // Sort
  const sortBy = filters.sort_by ?? 'created_at'
  const sortOrder = filters.sort_order ?? 'desc'
  items.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'urgency') {
      const ua = a.latest_analysis?.urgency ?? 0
      const ub = b.latest_analysis?.urgency ?? 0
      cmp = ua - ub
    } else {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder === 'desc' ? -cmp : cmp
  })

  const page = filters.page ?? 1
  const perPage = filters.per_page ?? 20
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const offset = (page - 1) * perPage
  const paged = items.slice(offset, offset + perPage)

  return { items: paged, total, page, per_page: perPage, total_pages: totalPages }
}

// --- Analytics ---

export function getAnalyticsSummary(): AnalyticsSummary {
  const items = loadItems()
  const analyzed = items.filter((i) => i.latest_analysis)

  const sentimentDist: Record<string, number> = {}
  const categoryDist: Record<string, number> = {}
  const statusDist: Record<string, number> = {}
  let urgencySum = 0
  const dailyUrgency: Record<string, { sum: number; count: number }> = {}

  for (const item of items) {
    statusDist[item.status] = (statusDist[item.status] ?? 0) + 1
  }

  for (const item of analyzed) {
    const a = item.latest_analysis!
    sentimentDist[a.sentiment] = (sentimentDist[a.sentiment] ?? 0) + 1
    categoryDist[a.category] = (categoryDist[a.category] ?? 0) + 1
    urgencySum += a.urgency
    const day = a.created_at.slice(0, 10)
    if (!dailyUrgency[day]) dailyUrgency[day] = { sum: 0, count: 0 }
    dailyUrgency[day].sum += a.urgency
    dailyUrgency[day].count += 1
  }

  const urgencyTrend = Object.entries(dailyUrgency)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({
      date,
      avg_urgency: Math.round((sum / count) * 10) / 10,
    }))

  return {
    total_feedback: items.length,
    total_analyzed: analyzed.length,
    sentiment_distribution: sentimentDist,
    category_distribution: categoryDist,
    average_urgency: analyzed.length > 0 ? Math.round((urgencySum / analyzed.length) * 10) / 10 : 0,
    urgency_trend: urgencyTrend,
    status_distribution: statusDist,
  }
}

// --- OpenAI direct call ---

const SYSTEM_PROMPT = `You are a customer feedback analyst. Your job is to extract structured
insights from raw customer feedback text.

You MUST respond with a JSON object matching this exact schema:
{
  "sentiment": one of ["positive","negative","neutral","mixed","urgent"],
  "category": one of ["bug","feature_request","complaint","praise",
                       "question","suggestion"],
  "urgency": integer 1-5 (1=low, 5=critical),
  "themes": array of 1-5 keyword strings (each under 50 chars),
  "suggested_action": one sentence describing the recommended next step,
  "summary": 2-3 sentence plain language summary of the feedback
}

Rules:
- Respond ONLY with the JSON object. No markdown, no explanation.
- If the feedback is ambiguous, use "neutral" sentiment and "question"
  category.
- Urgency 5 is reserved for: data loss, security issues, service outages.
- Urgency 1 is for: minor suggestions, cosmetic issues, general praise.
- themes should be concrete nouns/phrases, not abstract concepts.
- suggested_action should be actionable: "Fix the login timeout" not
  "Look into the issue".`

const MODEL = 'gpt-5.4-nano'

const COST_PER_1M_INPUT = 0.20
const COST_PER_1M_OUTPUT = 1.25

export async function callOpenAI(content: string): Promise<AnalysisResponse> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('OpenAI API key not set. Click the key icon in the navbar to add it.')

  const start = performance.now()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const latencyMs = Math.round(performance.now() - start)
  const rawText = data.choices?.[0]?.message?.content ?? ''
  const promptTokens = data.usage?.prompt_tokens ?? 0
  const completionTokens = data.usage?.completion_tokens ?? 0
  const tokensUsed = (data.usage?.total_tokens ?? 0)
  const costCents = (promptTokens / 1_000_000 * COST_PER_1M_INPUT + completionTokens / 1_000_000 * COST_PER_1M_OUTPUT) * 100

  // Parse and validate
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('LLM did not return valid JSON')
  }

  const validSentiments = ['positive', 'negative', 'neutral', 'mixed', 'urgent']
  const validCategories = ['bug', 'feature_request', 'complaint', 'praise', 'question', 'suggestion']

  const sentiment = (validSentiments.includes(parsed.sentiment as string) ? parsed.sentiment : 'neutral') as AnalysisResponse['sentiment']
  const category = (validCategories.includes(parsed.category as string) ? parsed.category : 'question') as AnalysisResponse['category']
  const urgency = Math.min(5, Math.max(1, Number(parsed.urgency) || 3))
  const themes = Array.isArray(parsed.themes) ? (parsed.themes as string[]).filter((t) => typeof t === 'string' && t.trim()).slice(0, 5) : []
  const suggestedAction = typeof parsed.suggested_action === 'string' ? parsed.suggested_action : 'Review this feedback'
  const summary = typeof parsed.summary === 'string' ? parsed.summary : 'No summary available'

  // Semantic checks
  const validationErrors: string[] = []
  if (urgency === 5 && !['negative', 'urgent'].includes(sentiment)) {
    validationErrors.push(`urgency=5 is only valid with negative or urgent sentiment, got '${sentiment}'`)
  }
  for (let i = 0; i < themes.length; i++) {
    if (themes[i].length > 50) validationErrors.push(`themes[${i}]: theme must be under 50 characters`)
  }
  if (summary.length < 10) validationErrors.push('summary: must be at least 10 characters')
  if (summary.length > 500) validationErrors.push('summary: must be under 500 characters')

  return {
    id: getNextAnalysisId(),
    sentiment,
    category,
    urgency,
    themes,
    suggested_action: suggestedAction,
    summary,
    model: MODEL,
    tokens_used: tokensUsed,
    latency_ms: latencyMs,
    cost_cents: Math.round(costCents * 10000) / 10000,
    is_valid: validationErrors.length === 0,
    validation_errors: validationErrors.length > 0 ? validationErrors : null,
    created_at: new Date().toISOString(),
  }
}
