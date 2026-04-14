import { useQuery } from '@tanstack/react-query'
import type { AnalyticsSummary } from '../types'
import * as store from '../store'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => store.getAnalyticsSummary() as AnalyticsSummary,
  })
}
