import { useQuery } from '@tanstack/react-query'
import type { AnalyticsSummary } from '../types'
import { apiClient } from './client'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.get<AnalyticsSummary>('/analytics/summary'),
  })
}
