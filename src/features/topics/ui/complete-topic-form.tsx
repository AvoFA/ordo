"use client";

import { useActionState } from "react";
import { completeTopicAction, type TopicActionState } from "@/features/topics/actions/topic.actions";
import { Button } from "@/shared/ui/button";

type CompleteTopicFormProps = {
  topicId: string;
  disabled?: boolean;
};

const initialState: TopicActionState = {};

export function CompleteTopicForm({ topicId, disabled = false }: CompleteTopicFormProps) {
  const [state, formAction, isPending] = useActionState(completeTopicAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="topicId" value={topicId} />
      <Button type="submit" className="w-full rounded-lg" disabled={disabled || isPending}>
        {isPending ? "Completing..." : "Complete Topic"}
      </Button>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
