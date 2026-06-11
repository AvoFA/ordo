"use client";

import { useActionState, useState } from "react";
import { updatePracticeTaskAction, deletePracticeTaskAction, type ActionState } from "@/features/practice/actions/practice.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type EditPracticeTaskFormProps = {
  taskId: string;
  initialTitle: string;
  initialDescription?: string | null;
  initialDifficulty: string;
  initialEstimatedMinutes?: number | null;
  initialStatus: string;
  onSuccess?: () => void;
};

const initialState: ActionState = {};

export function EditPracticeTaskForm({
  taskId,
  initialTitle,
  initialDescription,
  initialDifficulty,
  initialEstimatedMinutes,
  initialStatus,
  onSuccess
}: EditPracticeTaskFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updatePracticeTaskAction,
    initialState
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deletePracticeTaskAction,
    initialState
  );

  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const difficulties = [
    { value: "Foundation", label: t("practice.difficultyFoundation") },
    { value: "Intermediate", label: t("practice.difficultyIntermediate") },
    { value: "Applied", label: t("practice.difficultyApplied") },
  ];

  const statusOptions = [
    { value: "not-started", label: t("practice.statusNotStarted") },
    { value: "in-progress", label: t("practice.statusInProgress") },
    { value: "completed", label: t("practice.statusCompleted") }
  ];

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          await updateFormAction(formData);
          if (onSuccess) onSuccess();
        }}
        className="space-y-4"
        aria-label="Edit practice task"
      >
        <input type="hidden" name="taskId" value={taskId} />

        <div className="space-y-2">
          <label htmlFor="edit-task-title" className="text-sm font-medium text-foreground">
            {t("practice.taskTitle")}
          </label>
          <Input
            id="edit-task-title"
            name="title"
            defaultValue={initialTitle}
            placeholder={t("practice.taskTitlePlaceholder")}
            autoComplete="off"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-task-status" className="text-sm font-medium text-foreground">
            {t("practice.statusLabel")}
          </label>
          <Select id="edit-task-status" name="status" defaultValue={initialStatus}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-task-description" className="text-sm font-medium text-foreground">
            {t("practice.taskDescription")}
          </label>
          <textarea
            id="edit-task-description"
            name="description"
            defaultValue={initialDescription ?? ""}
            rows={3}
            placeholder={t("practice.taskDescriptionPlaceholder")}
            className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="edit-task-difficulty" className="text-sm font-medium text-foreground">
              {t("practice.difficultyLabel")}
            </label>
            <Select id="edit-task-difficulty" name="difficulty" defaultValue={initialDifficulty}>
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-task-minutes" className="text-sm font-medium text-foreground">
              {t("practice.estimatedTimeLabel")} ({t("practice.minutesUnit")})
            </label>
            <Input
              id="edit-task-minutes"
              name="estimatedMinutes"
              type="number"
              min={1}
              max={600}
              defaultValue={initialEstimatedMinutes ?? ""}
              placeholder="30"
            />
          </div>
        </div>

        {updateState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
            {updateState.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isUpdatePending} className="w-full">
          {isUpdatePending ? t("common.save") : t("common.save")}
        </Button>
      </form>

      <div className="border-t border-border/20 pt-4 space-y-3">
        <h4 className="text-sm font-bold text-destructive">Danger Zone</h4>
        {confirmDelete ? (
          <form action={deleteFormAction} className="flex gap-2">
            <input type="hidden" name="taskId" value={taskId} />
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
            Delete Practice Task
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
