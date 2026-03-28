import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { useUpdateNote } from '../../api/feedback'

interface NoteEditorProps {
  feedbackId: number
  note: string | null
}

export function NoteEditor({ feedbackId, note }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(note ?? '')
  const updateNote = useUpdateNote(feedbackId)

  const handleSave = () => {
    updateNote.mutate(
      { note: value },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">Note</span>
          <Button variant="ghost" onClick={() => setIsEditing(true)}>
            {note ? 'Edit' : 'Add Note'}
          </Button>
        </div>
        {note ? (
          <p className="text-sm text-text">{note}</p>
        ) : (
          <p className="text-sm text-text-secondary italic">No note added</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        label="Note"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Add a note..."
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateNote.isPending}>
          {updateNote.isPending ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
