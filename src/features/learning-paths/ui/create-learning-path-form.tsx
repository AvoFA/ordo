"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createLearningPathAction,
  type CreateLearningPathState,
} from "@/features/learning-paths/actions/learning-path.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useUiStore } from "@/shared/model/ui-store";

type CreateLearningPathFormProps = {
  onSuccess?: () => void;
};

const initialState: CreateLearningPathState = {};

export function CreateLearningPathForm({ onSuccess }: CreateLearningPathFormProps = {}) {
  const [state, formAction, isPending] = useActionState(createLearningPathAction, initialState);
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      addToast({
        type: "success",
        message: "Learning Path created",
        description: "Your new path was successfully initialized.",
      });
      if (onSuccess) {
        onSuccess();
      }
      router.push(state.redirectUrl);
    }
  }, [state.success, state.redirectUrl, addToast, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-4" aria-label="Create learning path">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Frontend Engineering"
          autoComplete="off"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What should this path help you learn?"
          className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Creating..." : "Create Learning Path"}
      </Button>
    </form>
  );
}
