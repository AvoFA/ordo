"use client";

import { useState, useEffect, useTransition } from "react";
import type { NotePreview } from "@/entities/note/model/note";
import { Button } from "@/shared/ui/button";
import { Calendar, ChevronRight, PanelLeftOpen, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { parseMarkdownToHtml, generateTOC } from "@/shared/lib/markdown";
import { toggleReviewLaterAction } from "@/features/notes/actions/note.actions";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type DocumentReaderProps = {
  note: NotePreview;
  onToggleLibrary: () => void;
};

export function DocumentReader({ note, onToggleLibrary }: DocumentReaderProps) {
  const [, startTransition] = useTransition();
  const [content, setContent] = useState(note.content ?? "");
  const [activeHeading, setActiveHeading] = useState<string>("");
  const { t } = useTranslation();

  const formattedHtml = parseMarkdownToHtml(content);
  const toc = generateTOC(content);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveHeading(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 1.0 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleReaderClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" && target.getAttribute("type") === "checkbox") {
      const idxAttr = target.getAttribute("data-checkbox-idx");
      if (idxAttr !== null) {
        e.preventDefault();
        const checkboxIdx = parseInt(idxAttr, 10);
        let currentCount = 0;
        const regex = /([-*]\s+\[)([ xX])(\])/g;
        
        const newContent = content.replace(regex, (match, prefix, state, suffix) => {
          if (currentCount === checkboxIdx) {
            const newState = state === " " ? "x" : " ";
            currentCount++;
            return `${prefix}${newState}${suffix}`;
          }
          currentCount++;
          return match;
        });

        setContent(newContent);

        const formData = new FormData();
        formData.append("noteId", note.id);
        formData.append("title", note.title || "");
        formData.append("content", newContent);

        const { updateNoteAction } = await import("@/features/notes/actions/document.actions");
        await updateNoteAction({}, formData);
      }
    }
  };

  const hasToc = toc.length >= 3;

  return (
    <article
      className={cn(
        "w-full px-4 pb-16 pt-4 animate-in fade-in duration-200 sm:px-6 lg:px-8",
        hasToc ? "mx-auto max-w-[1080px] xl:flex xl:items-start xl:gap-10" : "mx-auto max-w-[860px]"
      )}
    >
      <div className={cn("min-w-0 flex-1", hasToc ? "max-w-[820px]" : "w-full")}>
        {/* Document header */}
        <header className="mb-6 border-b border-border/20 pb-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
              <button
                type="button"
                onClick={onToggleLibrary}
                className="mr-1 flex cursor-pointer items-center gap-1.5 rounded-md border border-border/35 bg-secondary/25 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary/55 lg:hidden"
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground/80" />
                {t("notes.library")}
              </button>
              <span className="truncate">{note.linkedPath}</span>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/35" />
              <span className="truncate text-foreground/80">{note.linkedTopic}</span>
            </div>

            {/* Review Later toggle */}
            <form
              action={async (formData) => {
                startTransition(async () => {
                  await toggleReviewLaterAction({}, formData);
                });
              }}
            >
              <input type="hidden" name="documentId" value={note.id} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 text-[11px] font-bold gap-1.5 rounded-lg px-2.5 border transition-colors cursor-pointer",
                  note.reviewLater
                    ? "text-amber-500 border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/15"
                    : "text-muted-foreground/50 border-transparent hover:border-border/40 hover:text-muted-foreground"
                )}
                title={note.reviewLater ? t("notes.reviewingLater") : t("notes.reviewLater")}
              >
                <AlertCircle className="h-3 w-3" />
                {note.reviewLater ? t("notes.reviewingLater") : t("notes.reviewLater")}
              </Button>
            </form>
          </div>

          <h1 className="mb-3 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            {note.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            {note.updatedTime}
          </div>
        </header>

        {/* Document body — rendered markdown */}
        {content ? (
          <div
            onClick={handleReaderClick}
            className="ordo-prose"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground/40 italic font-medium">
              {t("notes.emptyContent")}
            </p>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border/15 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary/40 text-muted-foreground/70 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table of Contents (Sticky Sidebar) */}
      {toc.length >= 3 && (
        <aside className="hidden w-60 shrink-0 pt-4 xl:sticky xl:top-12 xl:block">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {t("notes.toc")}
            </h4>
            <div className="relative border-l border-border/30 ml-2 pl-3 py-1 space-y-2.5">
              {toc.map((item, idx) => {
                const isActive = activeHeading === item.id;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    style={{ paddingLeft: `${(item.level - 1) * 10}px` }}
                    className="relative"
                  >
                    {isActive && (
                      <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 h-3 w-[2px] bg-primary rounded-full" />
                    )}
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        "block text-[11px] font-medium transition-all line-clamp-2 leading-relaxed",
                        isActive
                          ? "text-primary font-bold"
                          : "text-muted-foreground/70 hover:text-foreground"
                      )}
                    >
                      {item.text}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}
    </article>
  );
}
