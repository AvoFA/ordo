"use client";

import { BookOpen, FileText, PanelLeftClose, Plus, Search } from "lucide-react";
import type { NotePreview } from "@/entities/note/model/note";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { KnowledgeTree } from "./knowledge-tree";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

export type DocumentFilter = "All Documents" | "Review Later";

type DocumentLibraryPanelProps = {
  filteredNotes: NotePreview[];
  groupedNotes: Record<string, Record<string, NotePreview[]>>;
  selectedNoteId: string | null;
  activeFilter: DocumentFilter;
  searchQuery: string;
  expandedPaths: Record<string, boolean>;
  expandedTopics: Record<string, boolean>;
  variant?: "desktop" | "drawer";
  onFilterChange: (filter: DocumentFilter) => void;
  onSearchChange: (query: string) => void;
  onTogglePath: (pathName: string) => void;
  onToggleTopic: (topicKey: string) => void;
  onSelectNote: (noteId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCreateDocument: () => void;
  onClose?: () => void;
};

export function DocumentLibraryPanel({
  filteredNotes,
  groupedNotes,
  selectedNoteId,
  activeFilter,
  searchQuery,
  expandedPaths,
  expandedTopics,
  variant = "desktop",
  onFilterChange,
  onSearchChange,
  onTogglePath,
  onToggleTopic,
  onSelectNote,
  onExpandAll,
  onCollapseAll,
  onCreateDocument,
  onClose,
}: DocumentLibraryPanelProps) {
  const isDrawer = variant === "drawer";
  const { t } = useTranslation();

  const filters: { value: DocumentFilter; label: string }[] = [
    { value: "All Documents", label: t("notes.filterAll") },
    { value: "Review Later", label: t("notes.filterReviewLater") },
  ];

  const documentWord = filteredNotes.length === 1 ? t("notes.document") : t("notes.documents");

  return (
    <aside
      className={cn(
        "flex h-full w-[320px] shrink-0 flex-col border-r border-border/25 bg-surface/80",
        isDrawer ? "shadow-2xl" : "hidden lg:flex"
      )}
    >
      <div className="border-b border-border/20 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {t("notes.knowledgeLibrary")}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {t("notes.notesGrouped")}
                </p>
              </div>
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              aria-label={t("notes.hideLibrary")}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={onCreateDocument}
          className="mt-4 h-9 w-full justify-start rounded-lg text-sm"
        >
          <Plus className="h-4 w-4" />
          {t("notes.newDocument")}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/25 bg-secondary/15 p-1">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onFilterChange(filter.value)}
                  className={cn(
                    "h-8 cursor-pointer rounded-md px-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-surface-elevated text-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
            <input
              type="text"
              placeholder={t("notes.searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-border/35 bg-background/55 pl-9 pr-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/55 focus:border-ring focus:ring-[3px] focus:ring-ring/20"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {filteredNotes.length > 0 ? (
            <KnowledgeTree
              groupedNotes={groupedNotes}
              selectedNoteId={selectedNoteId}
              expandedPaths={expandedPaths}
              expandedTopics={expandedTopics}
              onTogglePath={onTogglePath}
              onToggleTopic={onToggleTopic}
              onSelectNote={onSelectNote}
              onExpandAll={onExpandAll}
              onCollapseAll={onCollapseAll}
            />
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/35 bg-secondary/10 px-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary/35 text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{t("notes.noDocuments")}</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {searchQuery
                    ? t("notes.noDocumentsSearch")
                    : t("notes.noDocumentsEmpty")}
                </p>
              </div>
              {!searchQuery ? (
                <Button type="button" size="sm" onClick={onCreateDocument}>
                  <Plus className="h-4 w-4" />
                  {t("notes.createDocument")}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="border-t border-border/20 pt-3 text-[11px] font-semibold text-muted-foreground">
          <span>
            {filteredNotes.length} {documentWord}
          </span>
        </div>
      </div>
    </aside>
  );
}
