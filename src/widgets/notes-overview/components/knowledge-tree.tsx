"use client";

import { ChevronDown, ChevronRight, FileText, Folder, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { NotePreview } from "@/entities/note/model/note";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type KnowledgeTreeProps = {
  groupedNotes: Record<string, Record<string, NotePreview[]>>;
  selectedNoteId: string | null;
  expandedPaths: Record<string, boolean>;
  expandedTopics: Record<string, boolean>;
  onTogglePath: (pathName: string) => void;
  onToggleTopic: (topicKey: string) => void;
  onSelectNote: (noteId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function KnowledgeTree({
  groupedNotes,
  selectedNoteId,
  expandedPaths,
  expandedTopics,
  onTogglePath,
  onToggleTopic,
  onSelectNote,
  onExpandAll,
  onCollapseAll,
}: KnowledgeTreeProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 opacity-60" />
          {t("notes.library")}
        </span>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onExpandAll}
            className="text-[9px] font-bold text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          >
            {t("common.expandAll")}
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="text-[9px] font-bold text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          >
            {t("common.collapseAll")}
          </button>
        </div>
      </div>

      {/* Hierarchical Tree */}
      <div className="space-y-3 pr-1">
        {Object.entries(groupedNotes).map(([pathName, topics]) => {
          const isPathExpanded = expandedPaths[pathName] !== false; // default true
          const pathNoteCount = Object.values(topics).flat().length;

          return (
            <div key={pathName} className="space-y-1.5">
              {/* Path level */}
              <button
                type="button"
                onClick={() => onTogglePath(pathName)}
                className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/40"
              >
                <div className="flex min-w-0 items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/75 group-hover:text-foreground">
                  {isPathExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  )}
                  <Folder className="h-3.5 w-3.5 shrink-0 opacity-60 text-primary/70" />
                  <span className="truncate">{pathName}</span>
                </div>
                <span className="ml-2 rounded-full bg-secondary/35 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground/50">
                  {pathNoteCount}
                </span>
              </button>

              {/* Topics / Documents */}
              {isPathExpanded && (
                <div className="ml-3.5 mt-1 space-y-2 border-l border-border/20 pl-3">
                  {Object.entries(topics).map(([topicName, topicNotes]) => {
                    const topicKey = `${pathName}-${topicName}`;
                    const isTopicExpanded = expandedTopics[topicKey] !== false; // default true

                    return (
                      <div key={topicName} className="space-y-1">
                        {/* Topic level */}
                        <button
                          type="button"
                          onClick={() => onToggleTopic(topicKey)}
                          className="group flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary/30"
                        >
                          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/90 group-hover:text-foreground">
                            {isTopicExpanded ? (
                              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                            ) : (
                              <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                            )}
                            <span className="truncate">{topicName}</span>
                          </div>
                          <span className="ml-2 rounded-sm bg-secondary/10 px-1 text-[9px] font-semibold text-muted-foreground/40">
                            {topicNotes.length}
                          </span>
                        </button>

                        {/* Document level */}
                        {isTopicExpanded && (
                          <div className="ml-3 mt-0.5 space-y-1 border-l border-border/15 pl-3">
                            {topicNotes.map((note) => {
                              const isSelected = selectedNoteId === note.id;
                              const title = note.title?.trim() ? note.title : "Untitled Document";
                              const displayTitle = !isNaN(Number(title)) ? "Untitled Document" : title;

                              return (
                                <button
                                  key={note.id}
                                  type="button"
                                  onClick={() => onSelectNote(note.id)}
                                  className={cn(
                                    "group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg py-2 pl-3.5 pr-2.5 text-left text-xs transition-colors",
                                    isSelected
                                      ? "bg-primary/10 text-foreground font-semibold ring-1 ring-primary/15"
                                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground font-medium"
                                  )}
                                >
                                  {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                                  )}
                                  <FileText
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 transition-colors",
                                      isSelected
                                        ? "text-primary"
                                        : "text-muted-foreground/30 group-hover:text-muted-foreground/50"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "flex-1 truncate",
                                      displayTitle === "Untitled Document" && "italic opacity-70"
                                    )}
                                  >
                                    {displayTitle}
                                  </span>
                                  {note.reviewLater && (
                                    <span
                                      className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 shadow-sm"
                                      title={t("notes.reviewLater")}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
