"use client";

import { useActionState, useState } from "react";
import { updateNoteAction, deleteNoteAction, type ActionState } from "@/features/notes/actions/document.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type EditNoteFormProps = {
  noteId: string;
  initialTitle?: string | null;
  initialContent: string;
  onSuccess?: () => void;
};

const initialState: ActionState = {};

export function EditNoteForm({
  noteId,
  initialTitle,
  initialContent,
  onSuccess
}: EditNoteFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateNoteAction,
    initialState
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteNoteAction,
    initialState
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          await updateFormAction(formData);
          if (onSuccess) onSuccess();
        }}
        className="space-y-4"
        aria-label="Edit note"
      >
        <input type="hidden" name="noteId" value={noteId} />

        <div className="space-y-2">
          <label htmlFor="edit-note-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <Input
            id="edit-note-title"
            name="title"
            defaultValue={initialTitle ?? ""}
            placeholder="Semantic HTML notes"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-note-content" className="text-sm font-medium text-foreground">
            Note
          </label>
          <textarea
            id="edit-note-content"
            name="content"
            defaultValue={initialContent}
            rows={5}
            placeholder="Capture the useful idea from this topic."
            required
            className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {updateState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
            {updateState.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isUpdatePending} className="w-full">
          {isUpdatePending ? "Saving..." : "Save Note"}
        </Button>
      </form>

      <div className="border-t border-border/20 pt-4 space-y-3">
        <h4 className="text-sm font-bold text-destructive">Danger Zone</h4>
        {confirmDelete ? (
          <form action={deleteFormAction} className="flex gap-2">
            <input type="hidden" name="noteId" value={noteId} />
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeletePending}
              className="flex-1 text-xs"
            >
              {isDeletePending ? "Deleting..." : "Confirm Permanently Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            className="w-full text-xs"
          >
            Delete Note
          </Button>
        )}

        {deleteState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
            {deleteState.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
