import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '../components/ui/Badge'
import { sentimentVariant, statusVariant } from '../components/ui/badge-variants'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Label</Badge>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge).toHaveClass('bg-emerald-50')
  })

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge).toHaveClass('bg-red-50')
  })
})

describe('sentimentVariant', () => {
  it('maps positive to success', () => {
    expect(sentimentVariant('positive')).toBe('success')
  })

  it('maps negative to danger', () => {
    expect(sentimentVariant('negative')).toBe('danger')
  })

  it('maps neutral to neutral', () => {
    expect(sentimentVariant('neutral')).toBe('neutral')
  })

  it('maps mixed to warning', () => {
    expect(sentimentVariant('mixed')).toBe('warning')
  })

  it('maps urgent to danger', () => {
    expect(sentimentVariant('urgent')).toBe('danger')
  })

  it('returns default for unknown', () => {
    expect(sentimentVariant('unknown')).toBe('default')
  })
})

describe('statusVariant', () => {
  it('maps new to info', () => {
    expect(statusVariant('new')).toBe('info')
  })

  it('maps analyzed to success', () => {
    expect(statusVariant('analyzed')).toBe('success')
  })

  it('maps analysis_failed to danger', () => {
    expect(statusVariant('analysis_failed')).toBe('danger')
  })

  it('maps resolved to success', () => {
    expect(statusVariant('resolved')).toBe('success')
  })

  it('maps dismissed to neutral', () => {
    expect(statusVariant('dismissed')).toBe('neutral')
  })
})
