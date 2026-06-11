"use client";

import { useActionState, useEffect } from "react";
import { finishSessionAction, type SessionActionState } from "@/features/sessions/actions/session.actions";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type FinishSessionFormProps = {
  sessionId: string;
  durationMinutes?: number;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
};

const initialState: SessionActionState = {};

export function FinishSessionForm({ 
  sessionId, 
  durationMinutes, 
  disabled = false,
  variant = "secondary"
}: FinishSessionFormProps) {
  const [state, formAction, isPending] = useActionState(finishSessionAction, initialState);
  const addToast = useUiStore((s) => s.addToast);
  const { t } = useTranslation();

  useEffect(() => {
    if (state.success) {
      addToast({
        type: "success",
        message: t("sessions.sessionCompleted"),
        description: t("sessions.sessionCompletedDesc"),
      });
    }
  }, [state.success, addToast, t]);

  return (
    <form action={formAction} className="space-y-2 inline-block">
      <input type="hidden" name="sessionId" value={sessionId} />
      {durationMinutes !== undefined && (
        <input type="hidden" name="durationMinutes" value={durationMinutes} />
      )}
      <Button
        type="submit"
        variant={variant}
        className={variant === "default" 
          ? "rounded-lg h-9 px-5 font-bold text-xs shadow-sm bg-primary text-primary-foreground hover:bg-primary/95"
          : "border border-border/60 rounded-lg h-9 px-4 font-semibold text-xs"
        }
        disabled={disabled || isPending}
      >
        {isPending ? t("common.loading") : t("sessions.finishSession")}
      </Button>
      {state.error ? <p className="text-xs leading-5 text-destructive">{state.error}</p> : null}
    </form>
  );
}

