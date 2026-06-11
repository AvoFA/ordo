"use client";

import { useActionState, useEffect } from "react";
import { recordPracticeAttemptAction, type PracticeActionState } from "@/features/practice/actions/practice.actions";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type RecordPracticeAttemptFormProps = {
  taskId: string;
};

const initialState: PracticeActionState = {};

export function RecordPracticeAttemptForm({ taskId }: RecordPracticeAttemptFormProps) {
  const [state, formAction, isPending] = useActionState(
    recordPracticeAttemptAction,
    initialState,
  );
  const addToast = useUiStore((s) => s.addToast);
  const { t } = useTranslation();

  useEffect(() => {
    if (state.success) {
      addToast({
        type: "success",
        message: t("practice.attemptLogged"),
        description: t("practice.attemptLoggedDesc"),
      });
    }
  }, [state.success, addToast, t]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border/40 bg-secondary/15 p-4">
      <input type="hidden" name="taskId" value={taskId} />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t("practice.recordAttemptHeader")}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t("practice.recordAttemptSub")}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { value: "success", label: t("practice.resultSolved") },
          { value: "partial", label: t("practice.resultPartial") },
          { value: "failed", label: t("practice.resultBlocked") },
        ].map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border/45 bg-background/60 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/40"
          >
            <input
              type="radio"
              name="result"
              value={option.value}
              defaultChecked={option.value === "success"}
              className="h-3.5 w-3.5 accent-current"
            />
            {option.label}
          </label>
        ))}
      </div>
      <textarea
        name="reflection"
        rows={3}
        placeholder={t("practice.reflectionPlaceholder")}
        className="min-h-20 w-full resize-none rounded-md border border-border/50 bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/65 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
      />
      <Button type="submit" size="sm" className="w-full rounded-lg" disabled={isPending}>
        {isPending ? t("practice.recording") : t("practice.recordAttempt")}
      </Button>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
