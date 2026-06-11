"use client";

import { useState, useActionState } from "react";
import type { PracticeTopicOption } from "@/entities/practice-task/model/practice-task";
import {
  createPracticeTaskAction,
  type PracticeActionState,
} from "@/features/practice/actions/practice.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { TopicCombobox, type ComboboxOption } from "@/shared/ui/topic-combobox";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { ChevronDown } from "lucide-react";

type CreatePracticeTaskFormProps = {
  topicOptions?: PracticeTopicOption[];
  topicId?: string;
  compact?: boolean;
};

const initialState: PracticeActionState = {};
const difficulties = ["Foundation", "Intermediate", "Applied"] as const;

export function CreatePracticeTaskForm({
  topicOptions = [],
  topicId,
  compact = false,
}: CreatePracticeTaskFormProps) {
  const [state, formAction, isPending] = useActionState(createPracticeTaskAction, initialState);
  const { t } = useTranslation();
  const hasFixedTopic = Boolean(topicId);

  // Default to the passed topicId (active topic from context) if available
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topicId ?? "");

  const comboboxOptions: ComboboxOption[] = topicOptions.map((topic) => ({
    id: topic.id,
    label: topic.title,
    group: topic.pathTitle,
  }));

  return (
    <form action={formAction} className="space-y-4" aria-label={t("practice.dialogTitle")}>
      <div className="rounded-xl border border-border/35 bg-secondary/10 p-3 text-xs leading-5 text-muted-foreground">
        {t("practice.createGuidance")}
      </div>

      {hasFixedTopic ? <input type="hidden" name="topicId" value={topicId} /> : null}

      {!hasFixedTopic ? (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("practice.topicLabel")}
          </label>
          <TopicCombobox
            options={comboboxOptions}
            value={selectedTopicId}
            onChange={setSelectedTopicId}
            placeholder={t("practice.topicPlaceholder")}
            searchPlaceholder={t("practice.topicSearch")}
            emptyText={t("practice.topicEmpty")}
            name="topicId"
            required
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor={compact ? "session-practice-title" : "practice-title"}
          className="text-sm font-medium text-foreground"
        >
          {t("practice.taskTitle")}
        </label>
        <Input
          id={compact ? "session-practice-title" : "practice-title"}
          name="title"
          placeholder={t("practice.taskTitlePlaceholder")}
          autoComplete="off"
          required
        />
      </div>

      <details className="group rounded-xl border border-border/35 bg-secondary/5 p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
          {t("practice.advancedDetails")}
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={compact ? "session-practice-description" : "practice-description"}
              className="text-sm font-medium text-foreground"
            >
              {t("practice.taskDescription")}
            </label>
            <textarea
              id={compact ? "session-practice-description" : "practice-description"}
              name="description"
              rows={compact ? 3 : 4}
              placeholder={t("practice.taskDescriptionPlaceholder")}
              className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor={compact ? "session-practice-difficulty" : "practice-difficulty"}
                className="text-sm font-medium text-foreground"
              >
                {t("practice.difficultyLabel")}
              </label>
              <Select
                id={compact ? "session-practice-difficulty" : "practice-difficulty"}
                name="difficulty"
                defaultValue="Foundation"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {t(`practice.difficulty${difficulty}`)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={compact ? "session-practice-minutes" : "practice-minutes"}
                className="text-sm font-medium text-foreground"
              >
                {t("practice.estimatedTimeLabel")}
              </label>
              <div className="relative">
                <Input
                  id={compact ? "session-practice-minutes" : "practice-minutes"}
                  name="estimatedMinutes"
                  type="number"
                  min={1}
                  max={600}
                  placeholder="30"
                  className="pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground/60">
                  {t("practice.minutesUnit")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </details>

      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending || (!hasFixedTopic && !selectedTopicId)}
        className={compact ? "w-full" : "w-full sm:w-auto"}
      >
        {isPending ? t("practice.creatingBtn") : t("practice.createBtn")}
      </Button>
    </form>
  );
}
