"use client";

import { useState, useMemo } from "react";
import type { NotePreview } from "@/entities/note/model/note";
import { useDocumentEditor } from "../hooks/use-document-editor";
import { VersionHistoryPanel } from "./version-history-panel";
import { EditorToolbar } from "./editor-toolbar";
import { NoteEditorContent } from "./editor-content";
import { parseMarkdownToHtml } from "@/shared/lib/markdown";
import { cn } from "@/shared/lib/utils";
import { DraftRecoveryAlert, DeleteConfirmationAlert } from "./editor-alerts";
import { EditorHeader } from "./editor-header";

type DocumentEditorProps = {
  note: NotePreview;
  onToggleLibrary: () => void;
};

export function DocumentEditor({ note, onToggleLibrary }: DocumentEditorProps) {
  const editor = useDocumentEditor(note);
  const [editorView, setEditorView] = useState<"write" | "preview" | "split">("write");
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Render markdown parser preview
  const previewHtml = useMemo(() => parseMarkdownToHtml(editor.content), [editor.content]);

  // Click on checkbox in preview handles toggling its state in markdown
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Handle interactive checkboxes in preview
    if (target.tagName === "INPUT" && target.getAttribute("type") === "checkbox") {
      const idxAttr = target.getAttribute("data-checkbox-idx");
      if (idxAttr !== null) {
        e.preventDefault();
        const checkboxIdx = parseInt(idxAttr, 10);
        let currentCount = 0;
        const regex = /([-*]\s+\[)([ xX])(\])/g;
        
        const newContent = editor.content.replace(regex, (match, prefix, state, suffix) => {
          if (currentCount === checkboxIdx) {
            const newState = state === " " ? "x" : " ";
            currentCount++;
            return `${prefix}${newState}${suffix}`;
          }
          currentCount++;
          return match;
        });
        
        // Update Tiptap and local state
        editor.tiptapEditor?.commands.setContent(newContent);
        editor.setContent(newContent);
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full px-4 pb-16 pt-4 animate-in fade-in duration-200 sm:px-6 lg:px-8",
        editorView === "split" ? "max-w-none" : "mx-auto max-w-[1040px]"
      )}
    >
      <EditorHeader
        note={note}
        editor={editor}
        onToggleLibrary={onToggleLibrary}
        showDeleteMenu={showDeleteMenu}
        setShowDeleteMenu={setShowDeleteMenu}
        setShowVersionHistory={setShowVersionHistory}
        setConfirmDelete={setConfirmDelete}
      />

      <DeleteConfirmationAlert
        noteId={note.id}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        deleteError={deleteError}
        setDeleteError={setDeleteError}
      />

      <DraftRecoveryAlert
        editor={editor}
        noteId={note.id}
      />

      {/* Editor Content Area */}
      <div className={cn("relative mt-3", editorView === "split" ? "grid grid-cols-2 gap-5 items-start" : "")}>
        
        {/* Write Sheet (Visible in Write & Split views) */}
        {editorView !== "preview" && (
          <div className={cn("w-full overflow-hidden rounded-2xl border border-border/40 bg-surface-elevated/90 shadow-sm transition-all duration-200", editorView !== "split" && "mx-auto")}>
            <div className="flex items-center justify-between border-b border-border/15 bg-secondary/8 px-3 py-2.5">
              <EditorToolbar
                editor={editor}
                editorView={editorView}
                setEditorView={setEditorView}
                canUndo={editor.canUndo}
                canRedo={editor.canRedo}
              />
            </div>
            <div className="min-h-[calc(100vh-18rem)] p-6 md:p-9">
              <NoteEditorContent editor={editor} noteId={note.id} />
            </div>
          </div>
        )}

        {/* Preview Sheet (Visible in Preview & Split views) */}
        {editorView !== "write" && (
          <div className={cn("w-full overflow-hidden rounded-2xl border border-border/40 bg-surface-elevated/90 shadow-sm transition-all duration-200", editorView !== "split" && "mx-auto")}>
            <div className="flex items-center justify-between border-b border-border/15 bg-secondary/8 px-3 py-2.5">
              <EditorToolbar
                editor={editor}
                editorView={editorView}
                setEditorView={setEditorView}
                canUndo={false}
                canRedo={false}
                onlyViewSwitcher={true}
              />
            </div>
            <div
              onClick={handlePreviewClick}
              className="min-h-[calc(100vh-18rem)] p-6 md:p-9"
            >
              {editor.content.trim() ? (
                <div className="ordo-prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground/40 italic font-medium">
                  Preview will appear here
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {editor.updateError && (
        <p className="mt-4 text-xs text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {editor.updateError}
        </p>
      )}

      {showVersionHistory && (
        <VersionHistoryPanel
          noteId={note.id}
          currentContent={editor.content}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(restoredContent) => {
            editor.tiptapEditor?.commands.setContent(restoredContent);
            editor.setContent(restoredContent);
            setShowVersionHistory(false);
          }}
        />
      )}
    </div>
  );
}
