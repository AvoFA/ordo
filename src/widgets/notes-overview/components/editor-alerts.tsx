"use client";

import { useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { AlertCircle } from "lucide-react";
import { deleteNoteAction } from "@/features/notes/actions/document.actions";
import { useDocumentEditor } from "../hooks/use-document-editor";

type EditorType = ReturnType<typeof useDocumentEditor>;

type DraftRecoveryAlertProps = {
  editor: EditorType;
  noteId: string;
};

export function DraftRecoveryAlert({ editor, noteId }: DraftRecoveryAlertProps) {
  if (!editor.draftRestorationAvailable) return null;

  return (
    <div className="mb-4 flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold text-foreground">Unsaved draft recovered</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            editor.tiptapEditor?.commands.setContent(editor.draftRestorationAvailable!.content);
            editor.setContent(editor.draftRestorationAvailable!.content);
            editor.setTitle(editor.draftRestorationAvailable!.title);
            editor.setDraftRestorationAvailable(null);
            editor.setSaveStatus("Draft restored");
            setTimeout(() => editor.setSaveStatus(""), 3000);
          }}
          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Restore
        </button>
        <button
          type="button"
          onClick={() => {
            editor.setDraftRestorationAvailable(null);
            localStorage.removeItem(`ordo_draft_content_${noteId}`);
            localStorage.removeItem(`ordo_draft_title_${noteId}`);
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

type DeleteConfirmationAlertProps = {
  noteId: string;
  confirmDelete: boolean;
  setConfirmDelete: (confirm: boolean) => void;
  deleteError: string | null;
  setDeleteError: (err: string | null) => void;
};

export function DeleteConfirmationAlert({
  noteId,
  confirmDelete,
  setConfirmDelete,
  deleteError,
  setDeleteError,
}: DeleteConfirmationAlertProps) {
  const [isDeleting, startDeleteTransition] = useTransition();

  if (!confirmDelete) return null;

  return (
    <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
      <p className="text-sm text-foreground font-semibold">Delete this document?</p>
      <p className="text-xs text-muted-foreground">This cannot be undone.</p>
      <form
        action={async (formData) => {
          setDeleteError(null);
          startDeleteTransition(async () => {
            const res = await deleteNoteAction({}, formData);
            if (res.error) setDeleteError(res.error);
          });
        }}
        className="flex gap-2"
      >
        <input type="hidden" name="noteId" value={noteId} />
        <Button type="submit" variant="destructive" disabled={isDeleting} size="sm" className="text-xs font-semibold">
          {isDeleting ? "Deleting..." : "Confirm delete"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmDelete(false)}
          className="text-xs font-semibold"
        >
          Cancel
        </Button>
      </form>
      {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
    </div>
  );
}
