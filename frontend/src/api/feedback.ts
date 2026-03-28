import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  FeedbackFilters,
  FeedbackItem,
  PaginatedFeedbackResponse,
} from '../types'
import type { CreateFeedbackInput, UpdateNoteInput, UpdateStatusInput } from '../schemas/feedback'
import { apiClient } from './client'

export function useFeedbackList(filters: FeedbackFilters) {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.category) params.category = filters.category
  if (filters.sentiment) params.sentiment = filters.sentiment
  if (filters.urgency_min !== undefined) params.urgency_min = String(filters.urgency_min)
  if (filters.urgency_max !== undefined) params.urgency_max = String(filters.urgency_max)
  if (filters.search) params.search = filters.search
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
  if (filters.page) params.page = String(filters.page)
  if (filters.per_page) params.per_page = String(filters.per_page)

  return useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => apiClient.get<PaginatedFeedbackResponse>('/feedback', params),
  })
}

export function useFeedbackDetail(id: number) {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => apiClient.get<FeedbackItem>(`/feedback/${id}`),
    enabled: id > 0,
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFeedbackInput) =>
      apiClient.post<FeedbackItem>('/feedback', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useBulkCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: CreateFeedbackInput[]) =>
      apiClient.post<FeedbackItem[]>('/feedback/bulk', { items }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useUpdateStatus(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateStatusInput) =>
      apiClient.patch<FeedbackItem>(`/feedback/${id}/status`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', id] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useUpdateNote(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateNoteInput) =>
      apiClient.patch<FeedbackItem>(`/feedback/${id}/note`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', id] })
    },
  })
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/feedback/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}
