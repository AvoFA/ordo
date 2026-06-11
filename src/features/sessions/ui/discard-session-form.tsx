"use client";

import { useActionState, useEffect } from "react";
import { discardSessionAction, type SessionActionState } from "@/features/sessions/actions/session.actions";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { useUiStore } from "@/shared/model/ui-store";

type DiscardSessionFormProps = {
  sessionId: string;
  disabled?: boolean;
};

const initialState: SessionActionState = {};

export function DiscardSessionForm({ sessionId, disabled = false }: DiscardSessionFormProps) {
  const [state, formAction, isPending] = useActionState(discardSessionAction, initialState);
  const { t } = useTranslation();
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (state.error) {
      addToast({
        type: "error",
        message: "Error",
        description: state.error,
      });
    }
  }, [state.error, addToast]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(t("sessions.discardConfirm") || "Are you sure you want to discard this session? All timer progress will be lost.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="text-muted-foreground border-border/60 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 gap-1.5 h-9 rounded-lg text-xs font-semibold"
        disabled={disabled || isPending}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>{isPending ? t("common.loading") : t("sessions.discardSession")}</span>
      </Button>
    </form>
  );
}

