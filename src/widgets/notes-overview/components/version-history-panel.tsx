"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { ChevronRight, History, Calendar, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { getVersionsAction, restoreDocumentVersionAction, createDocumentVersionAction } from "@/features/notes/actions/version.actions";
import { formatDistanceToNow } from "date-fns";

type Version = {
  id: string;
  createdAt: Date | string;
  content: string;
};

type VersionHistoryPanelProps = {
  noteId: string;
  currentContent: string;
  onClose: () => void;
  onRestore: (content: string) => void;
};

function getContentExcerpt(content: string): string {
  // Remove base64 images entirely from previews
  let clean = content.replace(/!\[.*?\]\(data:image\/[^)]+\)/g, "[Image]");
  // Remove standard markdown images
  clean = clean.replace(/!\[.*?\]\([^)]+\)/g, "[Image]");
  // Strip headings marker
  clean = clean.replace(/^#+\s+/gm, "");
  // Strip bold/italics/code markdown
  clean = clean.replace(/[*_`#]/g, "");
  clean = clean.trim();
  if (clean.length > 100) {
    return clean.slice(0, 100) + "...";
  }
  return clean || "Empty snapshot";
}

export function VersionHistoryPanel({
  noteId,
  currentContent,
  onClose,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, startRestoreTransition] = useTransition();
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const [showStatus, setShowStatus] = useState<string>("");

  // Handle useLatestCallback polyfill for NextJS React 19 compatibility
  function useLatestCallback<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const ref = useRef(fn);
    useEffect(() => {
      ref.current = fn;
    });
    return useCallback((...args: unknown[]) => ref.current(...args), []) as unknown as T;
  }

  const fetchVersions = useLatestCallback(() => {
    setLoading(true);
    setError(null);
    getVersionsAction(noteId).then((res) => {
      if (res.error) {
        setError(res.error);
      } else if (res.versions) {
        setVersions(res.versions as unknown as Version[]);
      }
      setLoading(false);
    });
  });

  useEffect(() => {
    fetchVersions();
  }, [noteId, fetchVersions]);

  const handleCreateSnapshot = async () => {
    const formData = new FormData();
    formData.append("documentId", noteId);
    formData.append("content", currentContent);
    const res = await createDocumentVersionAction({}, formData);
    if (res.error) {
      setError(res.error);
    } else {
      setShowStatus("Snapshot created");
      setTimeout(() => setShowStatus(""), 3000);
      fetchVersions();
    }
  };

  const handleConfirmRestore = async (v: Version) => {
    const formData = new FormData();
    formData.append("versionId", v.id);

    startRestoreTransition(async () => {
      const res = await restoreDocumentVersionAction({}, formData);
      if (!res.error) {
        onRestore(v.content);
        setVersionToRestore(null);
        fetchVersions();
      } else {
        setError(res.error);
        setVersionToRestore(null);
      }
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-card border-l border-border/20 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/10 bg-secondary/10">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Snapshots</h3>
          {showStatus && (
            <span className="text-[10px] font-bold text-emerald-500 animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {showStatus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCreateSnapshot}
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-bold px-2.5 bg-background shadow-xs hover:bg-secondary/40"
          >
            Create Snapshot
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors hover:bg-secondary/40"
            aria-label="Close panel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {versionToRestore && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs text-foreground space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Restore this version?</p>
              <p className="text-muted-foreground mt-0.5">
                Your current document content will be automatically saved as a new snapshot first.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVersionToRestore(null)}
              className="text-[10px] h-6 px-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isRestoring}
              onClick={() => handleConfirmRestore(versionToRestore)}
              className="text-[10px] h-6 px-2.5"
            >
              {isRestoring ? "Restoring..." : "Confirm Restore"}
            </Button>
          </div>
        </div>
      )}

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <span className="text-xs">Loading versions...</span>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-xs text-destructive">{error}</p>
            <Button
              type="button"
              onClick={fetchVersions}
              variant="outline"
              size="sm"
              className="text-[10px]"
            >
              Retry
            </Button>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6 space-y-3">
            <History className="h-8 w-8 text-muted-foreground/25" />
            <p className="text-xs font-bold text-muted-foreground/60">No snapshots yet</p>
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed max-w-[220px]">
              Save a snapshot before making major edits to keep your history safe.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v, idx) => {
              const date = new Date(v.createdAt);
              const relativeTime = formatDistanceToNow(date, { addSuffix: true });
              const wordCount = v.content.trim().split(/\s+/).filter(Boolean).length;
              const charCount = v.content.length;
              const excerpt = getContentExcerpt(v.content);
              const versionNum = versions.length - idx;

              return (
                <div
                  key={v.id}
                  className="p-3 bg-secondary/15 rounded-xl border border-border/25 hover:border-border/60 transition-all duration-150 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary/70" />
                      Version {versionNum}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 font-bold"
                      onClick={() => setVersionToRestore(v)}
                      disabled={isRestoring || !!versionToRestore}
                    >
                      Restore
                    </Button>
                  </div>

                  <div className="text-[10px] text-muted-foreground font-medium flex flex-wrap gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {relativeTime}
                    </span>
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                  </div>

                  <div className="text-[10.5px] leading-relaxed text-muted-foreground/80 font-mono bg-secondary/20 p-2 rounded-lg border border-border/10 line-clamp-3">
                    {excerpt}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
