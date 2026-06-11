"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { updateTopicAction, deleteTopicAction, type ActionState } from "@/features/topics/actions/topic.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

type EditTopicFormProps = {
  topicId: string;
  initialTitle: string;
  initialDescription?: string | null;
  initialEstimatedMinutes?: number | null;
  initialNextStep?: string | null;
  initialStatus: string;
  onSuccess?: () => void;
};

const initialState: ActionState = {};

const statusOptions = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "review-later", label: "Review Later" }
];

export function EditTopicForm({
  topicId,
  initialTitle,
  initialDescription,
  initialEstimatedMinutes,
  initialNextStep,
  initialStatus,
  onSuccess
}: EditTopicFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateTopicAction,
    initialState
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteTopicAction,
    initialState
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-5">
      <form
        action={async (formData) => {
          await updateFormAction(formData);
          if (onSuccess) onSuccess();
        }}
        className="space-y-5"
        aria-label="Edit topic"
      >
        <input type="hidden" name="topicId" value={topicId} />

        <div className="grid gap-4 sm:grid-cols-[1.4fr_0.8fr]">
          <Field label="Title" htmlFor="edit-topic-title">
            <Input
              id="edit-topic-title"
              name="title"
              defaultValue={initialTitle}
              placeholder="Semantic HTML"
              autoComplete="off"
              required
            />
          </Field>

          <Field label="Status" htmlFor="edit-topic-status">
            <Select id="edit-topic-status" name="status" defaultValue={initialStatus}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description" htmlFor="edit-topic-description">
          <textarea
            id="edit-topic-description"
            name="description"
            defaultValue={initialDescription ?? ""}
            rows={3}
            placeholder="What should this topic clarify?"
            className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
          <Field label="Estimate" hint="Minutes" htmlFor="edit-topic-minutes">
            <Input
              id="edit-topic-minutes"
              name="estimatedMinutes"
              type="number"
              min={1}
              max={600}
              defaultValue={initialEstimatedMinutes ?? ""}
              placeholder="45"
            />
          </Field>

          <Field label="Next Step" htmlFor="edit-topic-next-step">
            <textarea
              id="edit-topic-next-step"
              name="nextStep"
              placeholder="e.g. Study landmark regions"
              defaultValue={initialNextStep ?? ""}
              rows={2}
              className="min-h-16 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </Field>
        </div>

        {updateState.error ? <FormError>{updateState.error}</FormError> : null}

        <Button type="submit" disabled={isUpdatePending} className="h-10 w-full">
          {isUpdatePending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
        {confirmDelete ? (
          <form action={deleteFormAction} className="space-y-3">
            <input type="hidden" name="topicId" value={topicId} />
            <div>
              <h4 className="text-sm font-semibold text-destructive">Delete this topic?</h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This removes nested subtopics, notes, sessions, and practice tasks connected to it.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeletePending}
                className="flex-1 text-xs"
              >
                {isDeletePending ? "Deleting..." : "Delete Permanently"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Advanced actions</h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Remove this topic only if it no longer belongs in the roadmap.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete Topic
            </Button>
          </div>
        )}

        {deleteState.error ? <FormError className="mt-3">{deleteState.error}</FormError> : null}
      </div>
    </div>
  );
}

function Field({
  children,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function FormError({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive",
        className,
      )}
    >
      {children}
    </p>
  );
}
