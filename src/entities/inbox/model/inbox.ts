export type InboxItemStatus = "captured" | "assigned" | "discarded";

export type InboxItemPreview = {
  id: string;
  title: string;
  source: "URL" | "MANUAL" | "FILE";
  type: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE";
  url?: string | null;
  description?: string | null;
  status: InboxItemStatus;
  capturedAt: string;
  assignedTopic?: string;
  assignedPath?: string;
};
