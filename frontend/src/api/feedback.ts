import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  FeedbackFilters,
  FeedbackItem,
  PaginatedFeedbackResponse,
} from '../types'
import type { CreateFeedbackInput, UpdateNoteInput, UpdateStatusInput } from '../schemas/feedback'
import * as store from '../store'

export function useFeedbackList(filters: FeedbackFilters) {
  return useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => store.listFeedback(filters) as PaginatedFeedbackResponse,
  })
}

export function useFeedbackDetail(id: number) {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => {
      const item = store.getFeedback(id)
      if (!item) throw new Error(`Feedback item ${id} not found`)
      return item as FeedbackItem
    },
    enabled: id > 0,
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFeedbackInput) => {
      const item = store.createFeedback(data.content, data.source ?? null)
      return Promise.resolve(item as FeedbackItem)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useUpdateStatus(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateStatusInput) => {
      const item = store.updateStatus(id, data.status)
      return Promise.resolve(item as FeedbackItem)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', id] })
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}

export function useUpdateNote(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateNoteInput) => {
      const item = store.updateNote(id, data.note)
      return Promise.resolve(item as FeedbackItem)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', id] })
    },
  })
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => {
      store.deleteFeedback(id)
      return Promise.resolve()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}
