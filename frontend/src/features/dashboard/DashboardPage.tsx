import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/ui/Button'
import { useFeedbackList } from '../../api/feedback'
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Manage and triage customer feedback
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Feedback
        </Button>
      </div>

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
