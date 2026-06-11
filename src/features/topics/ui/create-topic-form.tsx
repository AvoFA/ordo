"use client";

import { useEffect, useActionState } from "react";
import type { TopicParentOption } from "@/entities/topic/api/topics.repository";
import { createTopicAction, type TopicActionState } from "@/features/topics/actions/topic.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useUiStore } from "@/shared/model/ui-store";

type CreateTopicFormProps = {
  pathId: string;
  parentOptions: TopicParentOption[];
  onSuccess?: (topicId: string, topicTitle: string, pathTitle: string) => void;
};

const initialState: TopicActionState = {};

export function CreateTopicForm({ pathId, parentOptions, onSuccess }: CreateTopicFormProps) {
  const [state, formAction, isPending] = useActionState(createTopicAction, initialState);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (state.newTopicId && state.newTopicTitle) {
      addToast({
        type: "success",
        message: "Topic added",
        description: `${state.newTopicTitle} has been added to the path.`,
      });
      if (onSuccess) {
        onSuccess(state.newTopicId, state.newTopicTitle, state.newTopicPathTitle || "");
      }
    }
  }, [state.newTopicId, state.newTopicTitle, state.newTopicPathTitle, addToast, onSuccess]);

  return (
    <form action={formAction} className="space-y-4" aria-label="Create topic">
      <input type="hidden" name="pathId" value={pathId} />

      <div className="space-y-2">
        <label htmlFor="topic-title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <Input id="topic-title" name="title" placeholder="Semantic HTML" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="topic-parent" className="text-sm font-medium text-foreground">
          Parent Section / Topic
        </label>
        <Select id="topic-parent" name="parentId">
          <option value="">Root section</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {"— ".repeat(option.depth)}
              {option.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="topic-description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="topic-description"
          name="description"
          rows={3}
          placeholder="What should this topic clarify?"
          className="min-h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="estimated-minutes" className="text-sm font-medium text-foreground">
            Estimated Time (minutes)
          </label>
          <Input
            id="estimated-minutes"
            name="estimatedMinutes"
            type="number"
            min={1}
            max={600}
            placeholder="45"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="next-step" className="text-sm font-medium text-foreground">
            Next Step Action
          </label>
          <Input
            id="next-step"
            name="nextStep"
            placeholder="e.g. Study landmark regions"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Creating..." : "Create Topic"}
        </Button>
      </div>
    </form>
  );
}
