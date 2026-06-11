export type SessionStatus = "in-progress" | "completed";

export type LearningSession = {
  id: string;
  topicId: string | null;
  topic: string;
  path: string;
  pathSlug: string;
  status: SessionStatus;
  estimatedTime: string;
  progress: number;
  progressLabel: string;
  progressDescription: string;
  description: string;
  goal: string;
  nextStep: string;
  notesPlaceholder: string;
  resources: {
    id: string;
    title: string;
    source: "URL" | "MANUAL" | "FILE";
    url: string | null;
    type: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE";
    description: string | null;
    fileName?: string | null;
    sizeLabel?: string | null;
  }[];
  practice: string[];
  startedAt: Date;
  startedAtLabel: string;
  finishedAtLabel?: string;
  durationMinutes: number;
};

export type SuggestedSessionTopic = {
  id: string;
  title: string;
  path: string;
  pathSlug: string;
  estimatedTime: string;
  nextStep: string;
};
