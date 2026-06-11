import { useState, useEffect, useRef } from "react";
import { updateNoteAction } from "@/features/notes/actions/document.actions";

export function useEditorAutosave(
  noteId: string,
  title: string,
  content: string,
  initialContent: string,
  initialTitle: string
) {
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved just now" | "Saving..." | "Draft restored" | "">("");
  const [updateError, setUpdateError] = useState<string | null>(null);

  const lastSavedContent = useRef(initialContent);
  const lastSavedTitle = useRef(initialTitle);
  const saveRequestId = useRef(0);

  // Keep track of latest state for unmount autosave
  const stateRef = useRef({ noteId, title, content, isDirty });
  useEffect(() => {
    stateRef.current = { noteId, title, content, isDirty };
  }, [noteId, title, content, isDirty]);

  useEffect(() => {
    setIsDirty(content !== lastSavedContent.current || title !== lastSavedTitle.current);
  }, [content, title]);

  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(async () => {
      const requestId = saveRequestId.current + 1;
      saveRequestId.current = requestId;
      setSaveStatus("Saving...");
      const formData = new FormData();
      formData.append("noteId", noteId);
      formData.append("title", title);
      formData.append("content", content);

      const res = await updateNoteAction({}, formData);
      if (requestId !== saveRequestId.current) return;

      if (res.error) {
        setUpdateError(res.error);
        setSaveStatus("");
      } else {
        lastSavedContent.current = content;
        lastSavedTitle.current = title;
        setIsDirty(false);
        setSaveStatus("Saved just now");
        setUpdateError(null);
        setTimeout(() => setSaveStatus(""), 3000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, title, isDirty, noteId]);

  // Flush unsaved changes on unmount
  useEffect(() => {
    return () => {
      const { noteId: uNoteId, title: uTitle, content: uContent, isDirty: uIsDirty } = stateRef.current;
      if (uIsDirty) {
        const formData = new FormData();
        formData.append("noteId", uNoteId);
        formData.append("title", uTitle);
        formData.append("content", uContent);
        updateNoteAction({}, formData).catch((err) => {
          console.error("Autosave flush on unmount failed:", err);
        });
      }
    };
  }, []);

  return {
    isDirty,
    saveStatus,
    setSaveStatus,
    updateError,
    setUpdateError,
    lastSavedContent,
    lastSavedTitle,
    setIsDirty
  };
}
