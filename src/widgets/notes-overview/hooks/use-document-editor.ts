import { useState, useEffect, useCallback } from "react";
import type { NotePreview } from "@/entities/note/model/note";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";

import { useEditorAutosave } from "./use-editor-autosave";
import { uploadAttachmentAction } from "@/features/attachments/actions/attachment.actions";

type MarkdownEditorStorage = {
  markdown?: {
    getMarkdown: () => string;
  };
};

function getMarkdownFromEditor(editor: { storage: unknown }) {
  return (editor.storage as MarkdownEditorStorage).markdown?.getMarkdown() ?? "";
}

export function useDocumentEditor(note: NotePreview) {
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [draftRestorationAvailable, setDraftRestorationAvailable] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const autosave = useEditorAutosave(
    note.id,
    title,
    content,
    note.content ?? "",
    note.title ?? ""
  );

  // Initialize Tiptap Editor
  const tiptapEditor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        linkify: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        HTMLAttributes: {
          class: "border-collapse border border-border w-full my-4",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: "ordo-editor-image mx-auto rounded-lg shadow-sm max-w-full my-4 block cursor-pointer",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 transition-colors",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your study document... Type / for headings, lists, checklists, code, tables, and dividers.",
      }),
    ],
    content: note.content ?? "",
    onUpdate: ({ editor }) => {
      const markdown = getMarkdownFromEditor(editor);
      setContent(markdown);
    },
  });

  // Sync content when note.id or note.content changes from server/database
  useEffect(() => {
    if (tiptapEditor && note.id) {
      const currentMarkdown = getMarkdownFromEditor(tiptapEditor);
      if (currentMarkdown !== note.content) {
        tiptapEditor.commands.setContent(note.content ?? "");
        const nextContent = note.content ?? "";
        setTimeout(() => setContent(nextContent), 0);
      }
    }
  }, [note.id, note.content, tiptapEditor]);

  // Sync title from note prop on note change
  useEffect(() => {
    const nextTitle = note.title ?? "";
    const timer = setTimeout(() => setTitle(nextTitle), 0);
    return () => clearTimeout(timer);
  }, [note.id, note.title]);

  // Draft recovery check only on load/mount of note
  useEffect(() => {
    const draftContent = localStorage.getItem(`ordo_draft_content_${note.id}`);
    const draftTitle = localStorage.getItem(`ordo_draft_title_${note.id}`);
    if (
      (draftContent && draftContent !== note.content) ||
      (draftTitle && draftTitle !== note.title)
    ) {
      const draft = {
        content: draftContent ?? note.content ?? "",
        title: draftTitle ?? note.title ?? "",
      };
      const timer = setTimeout(() => setDraftRestorationAvailable(draft), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setDraftRestorationAvailable(null), 0);
      return () => clearTimeout(timer);
    }
  }, [note.id, note.content, note.title]);

  // Update drafts in localStorage
  useEffect(() => {
    if (autosave.isDirty) {
      localStorage.setItem(`ordo_draft_content_${note.id}`, content);
      localStorage.setItem(`ordo_draft_title_${note.id}`, title);
    } else {
      localStorage.removeItem(`ordo_draft_content_${note.id}`);
      localStorage.removeItem(`ordo_draft_title_${note.id}`);
    }
  }, [content, title, autosave.isDirty, note.id]);

  // Before unload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autosave.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autosave.isDirty]);

  // Image upload handler
  const handleImageFile = useCallback(
    async (file: File) => {
      if (!tiptapEditor) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const formData = new FormData();
        formData.append("documentId", note.id);
        formData.append("fileName", file.name);
        formData.append("mimeType", file.type);
        formData.append("base64Data", base64);

        const data = await uploadAttachmentAction(formData);
        if (data.error || !data.attachmentId) {
          autosave.setUpdateError(data.error || "Failed to upload image.");
        } else {
          tiptapEditor
            .chain()
            .focus()
            .setImage({ src: `/api/attachments/${data.attachmentId}`, alt: file.name })
            .run();
        }
      };
      reader.readAsDataURL(file);
    },
    [note.id, tiptapEditor, autosave]
  );

  const undo = useCallback(() => {
    tiptapEditor?.chain().focus().undo().run();
  }, [tiptapEditor]);

  const redo = useCallback(() => {
    tiptapEditor?.chain().focus().redo().run();
  }, [tiptapEditor]);

  return {
    content,
    setContent,
    title,
    setTitle,
    isDirty: autosave.isDirty,
    saveStatus: autosave.saveStatus,
    setSaveStatus: autosave.setSaveStatus,
    updateError: autosave.updateError,
    setUpdateError: autosave.setUpdateError,
    draftRestorationAvailable,
    setDraftRestorationAvailable,
    handleImageFile,
    tiptapEditor,
    undo,
    redo,
    canUndo: tiptapEditor?.can().undo() ?? false,
    canRedo: tiptapEditor?.can().redo() ?? false,
  };
}
