import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AnalysisResponse } from '../types'
import * as store from '../store'

export function useAnalyzeFeedback(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      // Transition to analyzing
      store.updateStatus(feedbackId, 'analyzing')
      void queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })

      try {
        const item = store.getFeedback(feedbackId)
        if (!item) throw new Error('Feedback not found')

        const analysis = await store.callOpenAI(item.content)
        const newStatus = analysis.is_valid ? 'analyzed' : 'analyzed'
        store.saveAnalysis(feedbackId, analysis, newStatus)
        return analysis
      } catch (err) {
        // Transition to analysis_failed
        try {
          const items = JSON.parse(localStorage.getItem('echolog_feedback') ?? '[]')
          const item = items.find((i: { id: number }) => i.id === feedbackId)
          if (item) {
            item.status = 'analysis_failed'
            item.updated_at = new Date().toISOString()
            localStorage.setItem('echolog_feedback', JSON.stringify(items))
          }
        } catch { /* ignore */ }
        throw err
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      void queryClient.invalidateQueries({ queryKey: ['analysis', 'history', feedbackId] })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useAnalysisHistory(feedbackId: number) {
  return useQuery({
    queryKey: ['analysis', 'history', feedbackId],
    queryFn: () => {
      const item = store.getFeedback(feedbackId)
      if (!item) return [] as AnalysisResponse[]
      const history: AnalysisResponse[] = []
      if (item.latest_analysis) history.push(item.latest_analysis)
      if (item.analysis_history) history.push(...item.analysis_history)
      return history
    },
    enabled: feedbackId > 0,
  })
}
