"use client";

import { useActionState, useState } from "react";
import { updateLearningPathAction, deleteLearningPathAction, type ActionState } from "@/features/learning-paths/actions/learning-path.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type EditLearningPathFormProps = {
  pathId: string;
  initialTitle: string;
  initialDescription?: string | null;
  onSuccess?: () => void;
};

const initialState: ActionState = {};

export function EditLearningPathForm({
  pathId,
  initialTitle,
  initialDescription,
  onSuccess
}: EditLearningPathFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateLearningPathAction,
    initialState
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteLearningPathAction,
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
        aria-label="Edit learning path"
      >
        <input type="hidden" name="pathId" value={pathId} />

        <div className="space-y-2">
          <label htmlFor="edit-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <Input
            id="edit-title"
            name="title"
            defaultValue={initialTitle}
            placeholder="Frontend Engineering"
            autoComplete="off"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            defaultValue={initialDescription ?? ""}
            rows={3}
            placeholder="What should this path help you learn?"
            className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {updateState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
            {updateState.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isUpdatePending} className="w-full">
          {isUpdatePending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="border-t border-border/20 pt-4 space-y-3">
        <h4 className="text-sm font-bold text-destructive">Danger Zone</h4>
        <p className="text-xs text-muted-foreground">
          Deleting this path will permanently remove all associated topics, sessions, practice tasks, notes, and resources.
        </p>

        {confirmDelete ? (
          <form action={deleteFormAction} className="flex gap-2">
            <input type="hidden" name="pathId" value={pathId} />
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
            Delete Learning Path
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
