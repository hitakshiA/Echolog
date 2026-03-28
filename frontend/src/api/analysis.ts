import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AnalysisResponse } from '../types'

import { apiClient } from './client'

export function useAnalyzeFeedback(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiClient.post<AnalysisResponse>(`/analysis/${feedbackId}/analyze`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useAnalysisHistory(feedbackId: number) {
  return useQuery({
    queryKey: ['analysis', 'history', feedbackId],
    queryFn: () =>
      apiClient.get<AnalysisResponse[]>(`/analysis/${feedbackId}/history`),
    enabled: feedbackId > 0,
  })
}
