"use client";

import { useActionState } from "react";
import type { PracticeTaskStatus } from "@/entities/practice-task/model/practice-task";
import {
  updatePracticeTaskStatusAction,
  type PracticeActionState,
} from "@/features/practice/actions/practice.actions";
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type PracticeStatusFormProps = {
  taskId: string;
  status: PracticeTaskStatus;
};

const initialState: PracticeActionState = {};

export function PracticeStatusForm({ taskId, status }: PracticeStatusFormProps) {
  const [state, formAction, isPending] = useActionState(updatePracticeTaskStatusAction, initialState);
  const { t } = useTranslation();

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="taskId" value={taskId} />
      <Select
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 text-xs font-semibold"
        aria-label={t("practice.title")}
      >
        <option value="not-started">{t("practice.statusNotStarted")}</option>
        <option value="in-progress">{t("practice.statusInProgress")}</option>
        <option value="completed">{t("practice.statusCompleted")}</option>
      </Select>
      {state.error ? <p className="text-xs leading-5 text-destructive">{state.error}</p> : null}
    </form>
  );
}
