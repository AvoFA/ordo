"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelRightOpen,
  Plus,
} from "lucide-react";
import type { NotePreview, NoteTopicOption } from "@/entities/note/model/note";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/model/ui-store";
import { cn } from "@/shared/lib/utils";
import { DocumentContextPanel } from "./components/document-context-panel";
import { DocumentCreateDialog } from "./components/document-create-dialog";
import {
  DocumentLibraryPanel,
  type DocumentFilter,
} from "./components/document-library-panel";
import { DocumentEditor } from "./components/document-editor";
import { DocumentReader } from "./components/document-reader";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type NotesOverviewProps = {
  notes: NotePreview[];
  topicOptions: NoteTopicOption[];
};

type GroupedNotes = Record<string, Record<string, NotePreview[]>>;

function getGroupedNotes(notes: NotePreview[]) {
  return notes.reduce<GroupedNotes>((acc, note) => {
    acc[note.linkedPath] ??= {};
    acc[note.linkedPath][note.linkedTopic] ??= [];
    acc[note.linkedPath][note.linkedTopic].push(note);
    return acc;
  }, {});
}

export function NotesOverview({ notes, topicOptions }: NotesOverviewProps) {
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [isTreeStateLoaded, setIsTreeStateLoaded] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { isEditMode } = useUiStore();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const paths = localStorage.getItem("ordo_expanded_paths");
        const topics = localStorage.getItem("ordo_expanded_topics");
        if (paths) setExpandedPaths(JSON.parse(paths));
        if (topics) setExpandedTopics(JSON.parse(topics));
      } catch {
        localStorage.removeItem("ordo_expanded_paths");
        localStorage.removeItem("ordo_expanded_topics");
      } finally {
        setIsTreeStateLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isTreeStateLoaded) return;
    localStorage.setItem("ordo_expanded_paths", JSON.stringify(expandedPaths));
    localStorage.setItem("ordo_expanded_topics", JSON.stringify(expandedTopics));
  }, [expandedPaths, expandedTopics, isTreeStateLoaded]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "\\") {
        event.preventDefault();
        if (window.matchMedia("(min-width: 1024px)").matches) {
          setIsLibraryVisible((visible) => !visible);
        } else {
          setIsMobileLibraryOpen((open) => !open);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notes.filter((note) => {
      if (activeFilter === "Review Later" && !note.reviewLater) return false;
      if (!query) return true;

      const title = note.title?.toLowerCase() || "untitled document";
      return (
        title.includes(query) ||
        note.linkedPath.toLowerCase().includes(query) ||
        note.linkedTopic.toLowerCase().includes(query)
      );
    });
  }, [activeFilter, notes, searchQuery]);

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ??
    filteredNotes[0] ??
    notes[0] ??
    null;

  const groupedNotes = useMemo(() => getGroupedNotes(filteredNotes), [filteredNotes]);

  const togglePath = (pathName: string) => {
    setExpandedPaths((prev) => ({ ...prev, [pathName]: !prev[pathName] }));
  };

  const toggleTopic = (topicKey: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  const setAllExpanded = (value: boolean) => {
    const nextPaths = Object.keys(groupedNotes).reduce<Record<string, boolean>>(
      (acc, pathName) => ({ ...acc, [pathName]: value }),
      {}
    );
    const nextTopics = Object.entries(groupedNotes).reduce<Record<string, boolean>>(
      (acc, [pathName, topics]) => ({
        ...acc,
        ...Object.keys(topics).reduce<Record<string, boolean>>(
          (topicAcc, topicName) => ({ ...topicAcc, [`${pathName}-${topicName}`]: value }),
          {}
        ),
      }),
      {}
    );

    setExpandedPaths(nextPaths);
    setExpandedTopics(nextTopics);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsMobileLibraryOpen(false);
  };

  const libraryPanelProps = {
    filteredNotes,
    groupedNotes,
    selectedNoteId: selectedNote?.id ?? null,
    activeFilter,
    searchQuery,
    expandedPaths,
    expandedTopics,
    onFilterChange: (filter: DocumentFilter) => {
      setActiveFilter(filter);
      setSelectedNoteId(null);
    },
    onSearchChange: setSearchQuery,
    onTogglePath: togglePath,
    onToggleTopic: toggleTopic,
    onSelectNote: handleSelectNote,
    onExpandAll: () => setAllExpanded(true),
    onCollapseAll: () => setAllExpanded(false),
    onCreateDocument: () => setIsCreateDialogOpen(true),
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {isLibraryVisible && !isFocusMode ? (
        <DocumentLibraryPanel
          {...libraryPanelProps}
          onClose={() => setIsLibraryVisible(false)}
        />
      ) : null}

      {isMobileLibraryOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsMobileLibraryOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <DocumentLibraryPanel
              {...libraryPanelProps}
              variant="drawer"
              onClose={() => setIsMobileLibraryOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 bg-background">
        <section className="min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-20 border-b border-border/20 bg-background/95 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-secondary/18 p-1">
                <Button
                  type="button"
                  variant={isLibraryVisible && !isFocusMode ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => {
                    if (window.matchMedia("(min-width: 1024px)").matches) {
                      setIsFocusMode(false);
                      setIsLibraryVisible((visible) => (isFocusMode ? true : !visible));
                    } else {
                      setIsMobileLibraryOpen(true);
                    }
                  }}
                  className="h-7 rounded-md px-2.5"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                 {isLibraryVisible && !isFocusMode ? t("notes.hideLibrary") : t("notes.showLibrary")}
                </Button>
                <Button
                  type="button"
                  variant={isDetailsVisible && !isFocusMode ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => {
                    setIsFocusMode(false);
                    setIsDetailsVisible((visible) => (isFocusMode ? true : !visible));
                  }}
                  className="hidden h-7 rounded-md px-2.5 xl:inline-flex"
                >
                  <PanelRightOpen className="h-4 w-4" />
                  {isDetailsVisible && !isFocusMode ? t("notes.hideDetails") : t("notes.showDetails")}
                </Button>
                <Button
                  type="button"
                  variant={isFocusMode ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setIsFocusMode((focus) => !focus)}
                  className="hidden h-7 rounded-md px-2.5 lg:inline-flex"
                >
                  {isFocusMode ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  {isFocusMode ? t("notes.exitFocus") : t("notes.focus")}
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className={cn(
                  "h-8 px-3",
                  isLibraryVisible && !isFocusMode && "lg:hidden"
                )}
              >
                <Plus className="h-4 w-4" />
                {t("notes.newBtn")}
              </Button>
            </div>
          </div>

          {selectedNote ? (
            <div
              className={cn(
                "mx-auto w-full",
                isFocusMode
                  ? "max-w-[1280px]"
                  : isEditMode
                    ? "max-w-[1120px]"
                    : "max-w-[1040px]"
              )}
            >
              {isEditMode ? (
                <DocumentEditor
                  key={selectedNote.id}
                  note={selectedNote}
                  onToggleLibrary={() => setIsMobileLibraryOpen((open) => !open)}
                />
              ) : (
                <DocumentReader
                  key={selectedNote.id}
                  note={selectedNote}
                  onToggleLibrary={() => setIsMobileLibraryOpen((open) => !open)}
                />
              )}
            </div>
          ) : (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
              <div className="max-w-md rounded-2xl border border-border/35 bg-surface-elevated/75 p-8 text-center shadow-sm">
                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  {t("notes.selectDocument")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("notes.selectDocumentDesc")}
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t("notes.newDocument")}
                </Button>
              </div>
            </div>
          )}
        </section>

        {isDetailsVisible && !isFocusMode ? (
          <DocumentContextPanel
            note={selectedNote}
            isEditMode={isEditMode}
            onClose={() => setIsDetailsVisible(false)}
          />
        ) : null}
      </main>

      <DocumentCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        topicOptions={topicOptions}
      />
    </div>
  );
}
