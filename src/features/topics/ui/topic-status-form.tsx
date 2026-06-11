"use client";

import { useActionState } from "react";
import type { TopicStatus } from "@/entities/topic/model/topic";
import {
  updateTopicStatusAction,
  type TopicActionState,
} from "@/features/topics/actions/topic.actions";

import { Select } from "@/shared/ui/select";

type TopicStatusFormProps = {
  topicId: string;
  status: TopicStatus;
};

const statusOptions: Array<{ value: TopicStatus; label: string }> = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "review-later", label: "Review Later" },
];

const initialState: TopicActionState = {};

export function TopicStatusForm({ topicId, status }: TopicStatusFormProps) {
  const [state, formAction, isPending] = useActionState(updateTopicStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-2" aria-label="Update topic status">
      <input type="hidden" name="topicId" value={topicId} />
      <Select
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {state.error ? <p className="text-xs leading-5 text-destructive">{state.error}</p> : null}
    </form>
  );
}
