"use client";

import { ChevronRight, History, MoreHorizontal, PanelLeftOpen, Trash2 } from "lucide-react";
import type { NotePreview } from "@/entities/note/model/note";
import { useDocumentEditor } from "../hooks/use-document-editor";

type EditorType = ReturnType<typeof useDocumentEditor>;

type EditorHeaderProps = {
  note: NotePreview;
  editor: EditorType;
  onToggleLibrary: () => void;
  showDeleteMenu: boolean;
  setShowDeleteMenu: (show: boolean) => void;
  setShowVersionHistory: (show: boolean) => void;
  setConfirmDelete: (confirm: boolean) => void;
};

export function EditorHeader({
  note,
  editor,
  onToggleLibrary,
  showDeleteMenu,
  setShowDeleteMenu,
  setShowVersionHistory,
  setConfirmDelete,
}: EditorHeaderProps) {
  return (
    <header className="mb-4 border-b border-border/20 pb-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
          <button
            type="button"
            onClick={onToggleLibrary}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border/35 bg-secondary/25 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary/55 lg:hidden"
            title="Toggle Library (Ctrl + \\)"
          >
            <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground/80" />
            Library
          </button>
          <span className="truncate">{note.linkedPath}</span>
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/35" />
          <span className="truncate text-foreground/80">{note.linkedTopic}</span>

          {(editor.saveStatus || editor.isDirty) && (
            <>
              <span className="mx-1 text-muted-foreground/30">/</span>
              {editor.saveStatus === "Saving..." ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-500/80">
                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                  Saving
                </span>
              ) : null}
              {editor.saveStatus === "Saved just now" ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500/80">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Saved
                </span>
              ) : null}
              {editor.saveStatus === "Draft restored" ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  Draft restored
                </span>
              ) : null}
              {!editor.saveStatus && editor.isDirty ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/55">
                  Unsaved
                </span>
              ) : null}
            </>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteMenu(!showDeleteMenu)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/45 hover:text-foreground"
            title="Document actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showDeleteMenu ? (
            <div className="absolute right-0 top-9 z-20 min-w-[180px] rounded-xl border border-border/45 bg-card p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setShowVersionHistory(true);
                  setShowDeleteMenu(false);
                }}
                className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
              >
                <History className="h-3.5 w-3.5" />
                Open snapshots
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setShowDeleteMenu(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-destructive transition-colors hover:bg-destructive/8"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete document
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <input
        id="edit-note-title"
        name="title"
        value={editor.title}
        onChange={(event) => editor.setTitle(event.target.value)}
        className="mt-1 w-full bg-transparent text-3xl font-semibold leading-tight text-foreground outline-none placeholder:text-muted-foreground/35 md:text-4xl"
        placeholder="Document title..."
      />
    </header>
  );
}
