import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { FeedbackTable } from '../features/dashboard/FeedbackTable'
import type { FeedbackItem } from '../types'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const mockItems: FeedbackItem[] = [
  {
    id: 1,
    content: 'The login page is broken and I cannot access my account at all',
    source: 'support_ticket',
    status: 'new',
    note: null,
    latest_analysis: null,
    created_at: '2026-03-28T00:00:00Z',
    updated_at: '2026-03-28T00:00:00Z',
  },
  {
    id: 2,
    content: 'Great app, love the design and everything about it',
    source: 'app_review',
    status: 'analyzed',
    note: null,
    latest_analysis: {
      id: 1,
      sentiment: 'positive',
      category: 'praise',
      urgency: 1,
      themes: ['design'],
      suggested_action: 'Keep it up',
      summary: 'User loves the app.',
      model: 'gpt-4o',
      tokens_used: 100,
      latency_ms: 300,
      cost_cents: 0.01,
      is_valid: true,
      validation_errors: null,
      created_at: '2026-03-28T00:00:00Z',
    },
    created_at: '2026-03-28T00:00:00Z',
    updated_at: '2026-03-28T00:00:00Z',
  },
]

describe('FeedbackTable', () => {
  it('shows loading state', () => {
    render(
      <MemoryRouter>
        <FeedbackTable items={[]} isLoading={true} />
      </MemoryRouter>
    )
    // Should show skeleton loading
    const container = document.querySelector('.animate-pulse')
    expect(container).toBeTruthy()
  })

  it('shows empty state', () => {
    render(
      <MemoryRouter>
        <FeedbackTable items={[]} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText(/No feedback items found/)).toBeInTheDocument()
  })

  it('renders rows for items', () => {
    render(
      <MemoryRouter>
        <FeedbackTable items={mockItems} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText(/login page is broken/)).toBeInTheDocument()
    expect(screen.getByText(/love the design/)).toBeInTheDocument()
  })

  it('shows sentiment badge for analyzed items', () => {
    render(
      <MemoryRouter>
        <FeedbackTable items={mockItems} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('positive')).toBeInTheDocument()
  })

  it('shows status badges', () => {
    render(
      <MemoryRouter>
        <FeedbackTable items={mockItems} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Analyzed')).toBeInTheDocument()
  })
})
