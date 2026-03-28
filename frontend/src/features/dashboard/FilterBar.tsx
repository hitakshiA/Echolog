import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import type { FeedbackFilters } from '../../types'

interface FilterBarProps {
  filters: FeedbackFilters
  onFilterChange: (filters: FeedbackFilters) => void
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'analysis_failed', label: 'Failed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const categoryOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'praise', label: 'Praise' },
  { value: 'question', label: 'Question' },
  { value: 'suggestion', label: 'Suggestion' },
]

const sentimentOptions = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'urgent', label: 'Urgent' },
]

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-end gap-3">
      <Select
        label="Status"
        options={statusOptions}
        placeholder="All statuses"
        value={filters.status ?? ''}
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value || undefined, page: 1 } as FeedbackFilters)
        }
      />
      <Select
        label="Category"
        options={categoryOptions}
        placeholder="All categories"
        value={filters.category ?? ''}
        onChange={(e) =>
          onFilterChange({ ...filters, category: e.target.value || undefined, page: 1 } as FeedbackFilters)
        }
      />
      <Select
        label="Sentiment"
        options={sentimentOptions}
        placeholder="All sentiments"
        value={filters.sentiment ?? ''}
        onChange={(e) =>
          onFilterChange({ ...filters, sentiment: e.target.value || undefined, page: 1 } as FeedbackFilters)
        }
      />
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search feedback..."
          value={filters.search ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value || undefined, page: 1 })
          }
        />
      </div>
      <button
        onClick={() =>
          onFilterChange({ ...filters, sort_order: filters.sort_order === 'desc' ? 'asc' : 'desc' })
        }
        className="flex h-[38px] items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-text-secondary transition-colors hover:bg-surface-alt"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" />
          <path d="M3 17l3 3 3-3" /><path d="M6 18V4" />
        </svg>
        {filters.sort_order === 'asc' ? 'Oldest' : 'Newest'}
      </button>
    </div>
  )
}
