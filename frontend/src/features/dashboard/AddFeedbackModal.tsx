import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { createFeedbackSchema, type CreateFeedbackInput } from '../../schemas/feedback'
import { useCreateFeedback } from '../../api/feedback'

interface AddFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const sourceOptions = [
  { value: 'app_review', label: 'App Review' },
  { value: 'support_ticket', label: 'Support Ticket' },
  { value: 'survey', label: 'Survey' },
  { value: 'slack', label: 'Slack' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
]

export function AddFeedbackModal({ isOpen, onClose }: AddFeedbackModalProps) {
  const createFeedback = useCreateFeedback()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFeedbackInput>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: { content: '', source: null },
  })

  const onSubmit = (data: CreateFeedbackInput) => {
    createFeedback.mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Feedback">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
        <Textarea
          label="Feedback Content"
          placeholder="Paste customer feedback here..."
          rows={5}
          error={errors.content?.message}
          {...register('content')}
        />
        <Select
          label="Source (optional)"
          options={sourceOptions}
          placeholder="Select source..."
          error={errors.source?.message}
          {...register('source', {
            setValueAs: (v: string) => (v === '' ? null : v),
          })}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createFeedback.isPending}>
            {createFeedback.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
