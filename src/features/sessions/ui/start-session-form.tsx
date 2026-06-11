"use client";

import { useActionState } from "react";
import { PlayCircle } from "lucide-react";
import { startSessionAction, type SessionActionState } from "@/features/sessions/actions/session.actions";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type StartSessionFormProps = {
  topicId: string;
  label?: string;
};

const initialState: SessionActionState = {};

export function StartSessionForm({ topicId, label }: StartSessionFormProps) {
  const [state, formAction, isPending] = useActionState(startSessionAction, initialState);
  const { t } = useTranslation();

  const displayLabel = label ?? t("topics.startLearning");

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="topicId" value={topicId} />
      <Button type="submit" size="sm" disabled={isPending} className="gap-2">
        <PlayCircle aria-hidden="true" className="h-4 w-4" />
        {isPending ? t("sessions.starting") : displayLabel}
      </Button>
      {state.error ? <p className="text-xs leading-5 text-destructive">{state.error}</p> : null}
    </form>
  );
}
