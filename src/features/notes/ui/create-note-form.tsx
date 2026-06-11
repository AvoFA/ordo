"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { NoteTopicOption } from "@/entities/note/model/note";
import { createNoteAction, type NoteActionState } from "@/features/notes/actions/note.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { BookOpen, FileText, Search } from "lucide-react";

type CreateNoteFormProps = {
  topicOptions?: NoteTopicOption[];
  topicId?: string;
  compact?: boolean;
  onSuccess?: () => void;
};

const initialState: NoteActionState = {};

export function CreateNoteForm({ topicOptions = [], topicId, compact = false, onSuccess }: CreateNoteFormProps) {
  const [state, formAction, isPending] = useActionState(createNoteAction, initialState);
  const [selectedTopicId, setSelectedTopicId] = useState(topicId ?? "");
  const [topicSearch, setTopicSearch] = useState("");
  const hasFixedTopic = Boolean(topicId);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const groupedTopics = useMemo(() => {
    const query = topicSearch.trim().toLowerCase();
    const filtered = topicOptions.filter((topic) => {
      if (!query) return true;
      return (
        topic.title.toLowerCase().includes(query) ||
        topic.pathTitle.toLowerCase().includes(query)
      );
    });

    return filtered.reduce<Record<string, NoteTopicOption[]>>((acc, topic) => {
      acc[topic.pathTitle] ??= [];
      acc[topic.pathTitle].push(topic);
      return acc;
    }, {});
  }, [topicOptions, topicSearch]);

  const selectedTopic = topicOptions.find((topic) => topic.id === selectedTopicId);

  return (
    <form action={formAction} className="space-y-5" aria-label="Create note">
      <input type="hidden" name="topicId" value={selectedTopicId} />

      {!hasFixedTopic ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="note-topic-search" className="text-sm font-semibold text-foreground">
              Learning topic
            </label>
            {selectedTopic ? (
              <span className="text-xs font-medium text-muted-foreground">
                {selectedTopic.pathTitle}
              </span>
            ) : null}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
            <Input
              id="note-topic-search"
              value={topicSearch}
              onChange={(event) => setTopicSearch(event.target.value)}
              placeholder="Search path or topic"
              className="pl-9"
              autoComplete="off"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-border/35 bg-secondary/10 p-2">
            {Object.keys(groupedTopics).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(groupedTopics).map(([pathTitle, topics]) => (
                  <section key={pathTitle} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/65">
                      <BookOpen className="h-3 w-3" />
                      {pathTitle}
                    </div>
                    <div className="space-y-1">
                      {topics.map((topic) => {
                        const isSelected = selectedTopicId === topic.id;
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => setSelectedTopicId(topic.id)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-secondary/55"
                            )}
                          >
                            <FileText className="h-4 w-4 shrink-0 opacity-75" />
                            <span className="min-w-0 flex-1 truncate font-medium">
                              {topic.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No topics match your search.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={compact ? "session-note-title" : "note-title"} className="text-sm font-medium text-foreground">
          Document title
        </label>
        <Input
          id={compact ? "session-note-title" : "note-title"}
          name="title"
          placeholder="Semantic HTML summary"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={compact ? "session-note-content" : "note-content"} className="text-sm font-medium text-foreground">
          First thought
        </label>
        <textarea
          id={compact ? "session-note-content" : "note-content"}
          name="content"
          rows={compact ? 3 : 4}
          placeholder="Capture the idea you want to remember from this topic."
          required
          className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

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
        {isPending ? "Creating..." : "Create and open"}
      </Button>
    </form>
  );
}
