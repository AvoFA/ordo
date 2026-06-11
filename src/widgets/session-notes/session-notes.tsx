"use client";

import type { NotePreview } from "@/entities/note/model/note";
import { NoteCard } from "@/entities/note/ui/note-card";
import { NotebookTabs, Plus } from "lucide-react";
import { CreateNoteForm } from "@/features/notes/ui/create-note-form";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import Link from "next/link";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { useState } from "react";

type SessionNotesProps = {
  placeholder: string;
  notes: NotePreview[];
  topicId: string | null;
};

export function SessionNotes({ placeholder, notes, topicId }: SessionNotesProps) {
  const { isEditMode } = useUiStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className="rounded-lg border-border/70 bg-card/85 shadow-none">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookTabs aria-hidden="true" className="h-4 w-4 text-primary" />
          {t("nav.notes")}
        </CardTitle>
        <div className="flex items-center gap-2">
          {isEditMode && topicId && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => setShowForm(!showForm)}
              className="h-7 w-7 rounded-md hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
              title="Add Note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button asChild variant="secondary" size="sm" className="h-7 border border-border/60 rounded-md text-xs font-bold px-2.5">
            <Link href="/notes">
              {t("today.recentKnowledge")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inline Create Note Form */}
        {isEditMode && topicId && (showForm || notes.length === 0) && (
          <div className="rounded-lg border border-border/30 bg-secondary/10 p-4 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
              {t("sessions.inlineNotePrompt")}
            </h4>
            <CreateNoteForm 
              topicId={topicId} 
              compact={true} 
              onSuccess={() => setShowForm(false)} 
            />
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} variant="compact" />
          ))}
          {notes.length === 0 && !showForm && (
            <div className="rounded-lg border border-dashed border-border/80 bg-secondary/25 p-4 text-sm leading-6 text-muted-foreground text-center">
              {placeholder}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
