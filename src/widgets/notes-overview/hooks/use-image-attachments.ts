import { useCallback } from "react";
import { uploadAttachmentAction } from "@/features/attachments/actions/attachment.actions";

type ImageAttachmentHookProps = {
  noteId: string;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  contentLength: number;
  setContent: (value: string | ((prev: string) => string)) => void;
  setContentWithHistory: (value: string | ((prev: string) => string)) => void;
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setUpdateError: (error: string | null) => void;
};

export function useImageAttachments({
  noteId,
  textareaRef,
  contentLength,
  setContent,
  setContentWithHistory,
  setHistory,
  setUpdateError,
}: ImageAttachmentHookProps) {
  const handleImageFile = useCallback(
    (file: File) => {
      const placeholder = `\n![Uploading ${file.name}...]()\n`;
      const textarea = textareaRef.current;
      const insertAt = textarea ? textarea.selectionStart : contentLength;

      if (textarea) {
        const text = textarea.value;
        const newValue = text.substring(0, insertAt) + placeholder + text.substring(insertAt);
        setContentWithHistory(newValue);
      } else {
        setContentWithHistory((prev) => prev + placeholder);
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const formData = new FormData();
        formData.append("documentId", noteId);
        formData.append("fileName", file.name);
        formData.append("mimeType", file.type);
        formData.append("base64Data", base64);

        const res = await uploadAttachmentAction(formData);

        setContent((prev) => {
          if (res.error || !res.attachmentId) {
            setUpdateError(res.error || "Failed to upload image.");
            return prev.replace(placeholder, `\n![Upload Failed: ${res.error || "Unknown Error"}]()\n`);
          }
          return prev.replace(placeholder, `\n![${file.name}](/api/attachments/${res.attachmentId})\n`);
        });

        setHistory((h) => {
          const newH = [...h];
          const errorOrImg = (res.error || !res.attachmentId)
            ? `\n![Upload Failed: ${res.error || "Unknown Error"}]()\n`
            : `\n![${file.name}](/api/attachments/${res.attachmentId})\n`;
          newH[newH.length - 1] = newH[newH.length - 1].replace(placeholder, errorOrImg);
          return newH;
        });
      };
      reader.readAsDataURL(file);
    },
    [contentLength, noteId, setContent, setContentWithHistory, setHistory, setUpdateError, textareaRef]
  );

  return { handleImageFile };
}
