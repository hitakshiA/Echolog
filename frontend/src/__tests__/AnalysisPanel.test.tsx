import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AnalysisPanel } from '../features/detail/AnalysisPanel'
import type { AnalysisResponse } from '../types'

const mockAnalysis: AnalysisResponse = {
  id: 1,
  sentiment: 'negative',
  category: 'bug',
  urgency: 3,
  themes: ['login', 'timeout'],
  suggested_action: 'Fix the login timeout issue',
  summary: 'User reports login is broken.',
  model: 'gpt-4o',
  tokens_used: 150,
  latency_ms: 500,
  cost_cents: 0.02,
  is_valid: true,
  validation_errors: null,
  created_at: '2026-03-28T00:00:00Z',
}

describe('AnalysisPanel', () => {
  it('shows placeholder when no analysis', () => {
    render(<AnalysisPanel analysis={null} />)
    expect(screen.getByText(/No analysis yet/)).toBeInTheDocument()
  })

  it('shows sentiment badge', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('negative')).toBeInTheDocument()
  })

  it('shows category', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })

  it('shows urgency', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('shows themes as chips', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('login')).toBeInTheDocument()
    expect(screen.getByText('timeout')).toBeInTheDocument()
  })

  it('shows suggested action', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('Fix the login timeout issue')).toBeInTheDocument()
  })

  it('shows summary', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText('User reports login is broken.')).toBeInTheDocument()
  })

  it('shows metadata', () => {
    render(<AnalysisPanel analysis={mockAnalysis} />)
    expect(screen.getByText(/gpt-4o/)).toBeInTheDocument()
    expect(screen.getByText(/150/)).toBeInTheDocument()
    expect(screen.getByText(/500ms/)).toBeInTheDocument()
  })

  it('shows validation errors when invalid', () => {
    const invalidAnalysis: AnalysisResponse = {
      ...mockAnalysis,
      is_valid: false,
      validation_errors: ['urgency too high for positive sentiment'],
    }
    render(<AnalysisPanel analysis={invalidAnalysis} />)
    expect(screen.getByText(/urgency too high/)).toBeInTheDocument()
  })
})
