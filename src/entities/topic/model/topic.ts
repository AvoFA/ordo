export type TopicStatus = "not-started" | "in-progress" | "completed" | "review-later";

export type TopicLearningState =
  | "not-started"
  | "learning"
  | "practicing"
  | "review-needed"
  | "mastered";

export type TopicCompletionSignal = {
  key: "session" | "knowledge" | "resource" | "practiceAttempted" | "practiceSolved";
  label: string;
  description: string;
  complete: boolean;
};

export type TopicCompletion = {
  state: TopicLearningState;
  signals: TopicCompletionSignal[];
  canComplete: boolean;
  isCompleted: boolean;
  nextRequirement: string;
  completedCount: number;
  checklistTotal: number;
  percentage: number;
  completedAtLabel?: string;
};

export type TopicPreview = {
  id: string;
  title: string;
  description: string;
  status: TopicStatus;
  estimatedTime: string;
  estimatedMinutes?: number | null;
  nextStep: string;
  completion?: TopicCompletion;
  activeSessionId?: string;
  sessionId?: string;
};

export type TopicSection = {
  id: string;
  title: string;
  progress: number;
  completedCount?: number;
  readyCount?: number;
  topicCount?: number;
  topics: TopicPreview[];
};
