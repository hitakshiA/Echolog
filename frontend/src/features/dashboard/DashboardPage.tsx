import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/ui/Button'
import { useFeedbackList } from '../../api/feedback'
import { getApiKey } from '../../store'
import type { FeedbackFilters } from '../../types'
import { StatsBar } from './StatsBar'
import { FilterBar } from './FilterBar'
import { FeedbackTable } from './FeedbackTable'
import { Pagination } from './Pagination'
import { AddFeedbackModal } from './AddFeedbackModal'

function parseFiltersFromParams(params: URLSearchParams): FeedbackFilters {
  return {
    status: params.get('status') ?? undefined,
    category: params.get('category') ?? undefined,
    sentiment: params.get('sentiment') ?? undefined,
    search: params.get('search') ?? undefined,
    sort_by: (params.get('sort_by') as FeedbackFilters['sort_by']) ?? 'created_at',
    sort_order: (params.get('sort_order') as FeedbackFilters['sort_order']) ?? 'desc',
    page: Number(params.get('page')) || 1,
    per_page: 20,
  } as FeedbackFilters
}

function filtersToParams(filters: FeedbackFilters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.category) params.category = filters.category
  if (filters.sentiment) params.sentiment = filters.sentiment
  if (filters.search) params.search = filters.search
  if (filters.sort_by && filters.sort_by !== 'created_at') params.sort_by = filters.sort_by
  if (filters.sort_order && filters.sort_order !== 'desc') params.sort_order = filters.sort_order
  if (filters.page && filters.page > 1) params.page = String(filters.page)
  return params
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filters = parseFiltersFromParams(searchParams)
  const { data, isLoading } = useFeedbackList(filters)

  const handleFilterChange = (newFilters: FeedbackFilters) => {
    setSearchParams(filtersToParams(newFilters))
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-9">
        {/* Decorative echo rings */}
        <svg className="pointer-events-none absolute -right-12 -top-12 opacity-[0.04]" width="280" height="280" viewBox="0 0 280 280" fill="none">
          <circle cx="140" cy="140" r="135" stroke="#7C3AED" strokeWidth="2" />
          <circle cx="140" cy="140" r="100" stroke="#7C3AED" strokeWidth="2" />
          <circle cx="140" cy="140" r="65" stroke="#7C3AED" strokeWidth="2" />
          <circle cx="140" cy="140" r="30" stroke="#7C3AED" strokeWidth="2" />
        </svg>
        <div className="relative flex items-end justify-between">
          <div>
            <h1 className="font-display text-[2rem] leading-tight text-text" style={{ fontStyle: 'italic' }}>
              Customer Feedback
            </h1>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-text-muted">
              Paste raw feedback, get structured insights. Sentiment, category, urgency, themes &mdash; analyzed in seconds.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Feedback
          </Button>
        </div>
      </div>

      {!getApiKey() && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-600">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <p className="text-sm text-amber-800">
            <strong>API key required.</strong> Click the key icon in the top-right corner of the navbar to add your OpenAI API key before running analysis.
          </p>
        </div>
      )}

      <StatsBar data={data} isLoading={isLoading} />

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      <FeedbackTable items={data?.items ?? []} isLoading={isLoading} />

      <Pagination
        page={filters.page ?? 1}
        totalPages={data?.total_pages ?? 1}
        onPageChange={(page) => handleFilterChange({ ...filters, page })}
      />

      <AddFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
