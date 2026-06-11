export type PracticeTaskStatus = "not-started" | "in-progress" | "completed";
export type PracticeTaskDifficulty = "Foundation" | "Intermediate" | "Applied";
export type PracticeAttemptResult = "success" | "partial" | "failed";

export type PracticeAttemptSummary = {
  total: number;
  successful: number;
  latestResult?: PracticeAttemptResult;
  latestReflection?: string;
};

export type PracticeTaskPreview = {
  id: string;
  title: string;
  linkedPath: string;
  linkedTopic: string;
  description: string;
  instruction: string;
  status: PracticeTaskStatus;
  difficulty: PracticeTaskDifficulty;
  estimatedTime: string;
  tags: string[];
  attemptSummary?: PracticeAttemptSummary;
};

export type PracticeTopicOption = {
  id: string;
  title: string;
  pathTitle: string;
};
