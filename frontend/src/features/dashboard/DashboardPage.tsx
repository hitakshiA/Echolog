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
    <div className="flex flex-col gap-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-10">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <circle cx="300" cy="100" r="120" fill="white" />
            <circle cx="150" cy="300" r="80" fill="white" />
            <circle cx="350" cy="280" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Customer Feedback
            </h1>
            <p className="mt-2 max-w-md text-base text-white/70">
              Collect, analyze, and act on customer feedback. Turn raw text into structured insights with AI.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Feedback
          </Button>
        </div>
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
