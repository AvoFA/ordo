"use client";

import type { NoteTopicOption } from "@/entities/note/model/note";
import { CreateNoteForm } from "@/features/notes/ui/create-note-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";

type DocumentCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicOptions: NoteTopicOption[];
};

export function DocumentCreateDialog({
  open,
  onOpenChange,
  topicOptions,
}: DocumentCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b border-border/30 bg-secondary/15 px-6 py-5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Create knowledge document
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-lg text-sm leading-6">
            Attach the document to a learning topic first. Ordo keeps notes useful by
            preserving the path and topic context around them.
          </DialogDescription>
        </div>
        <div className="px-6 py-5">
          <CreateNoteForm
            topicOptions={topicOptions}
            compact={false}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
