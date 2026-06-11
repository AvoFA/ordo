"use client";

import {
  BookOpen,
  Calendar,
  FileText,
  Lightbulb,
  PanelRightClose,
  Route,
  Tag,
} from "lucide-react";
import type { NotePreview } from "@/entities/note/model/note";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type DocumentContextPanelProps = {
  note: NotePreview | null;
  isEditMode: boolean;
  onClose: () => void;
};

export function DocumentContextPanel({ note, isEditMode, onClose }: DocumentContextPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-[280px] shrink-0 border-l border-border/25 bg-surface/70 px-5 py-6 xl:flex">
      {note ? (
        <div className="flex h-full w-full flex-col gap-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">
                {t("notes.learningContext")}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                aria-label={t("notes.hideDetails")}
                title={t("notes.hideDetails")}
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl border border-border/35 bg-surface-elevated/70 p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/55">
                      {t("notes.path")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {note.linkedPath}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/55">
                      {t("notes.topic")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {note.linkedTopic}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">
              {t("notes.documentState")}
            </p>
            <div className="space-y-2 rounded-xl border border-border/30 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{note.updatedTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>{isEditMode ? t("notes.editingDocument") : t("notes.readingDocument")}</span>
              </div>
              <div
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                  note.reviewLater
                    ? "bg-amber-500/12 text-amber-600 dark:text-amber-300"
                    : "bg-secondary/50 text-muted-foreground"
                )}
              >
                {note.reviewLater ? t("notes.reviewLater") : t("notes.noReviewFlag")}
              </div>
            </div>
          </section>

          {note.tags.length > 0 ? (
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">
                {t("notes.tags")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-border/30 bg-secondary/25 px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">
              {t("notes.guidance")}
            </p>
            <div className="space-y-2">
              <div className="flex w-full items-center gap-2 rounded-lg border border-border/25 bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                {t("notes.guidanceTip1")}
              </div>
              <div className="flex w-full items-center gap-2 rounded-lg border border-border/25 bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                <Route className="h-3.5 w-3.5" />
                {t("notes.guidanceTip2")}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="flex h-full items-center">
          <p className="text-sm leading-6 text-muted-foreground">
            {t("notes.selectDocumentContext")}
          </p>
        </div>
      )}
    </aside>
  );
}
