import type { TopicSection } from "@/entities/topic/model/topic";

export type LearningPathPreview = {
  id: string;
  slug: string;
  title: string;
  description: string;
  progress: number;
  topicCount: number;
  completedTopicCount?: number;
  readyTopicCount?: number;
  lastActivity: string;
  focus: string;
  nextStep?: string | null;
  status?: "ready-to-start" | "learning" | "needs-review" | "completed";
};

export type LearningPathDetail = LearningPathPreview & {
  sections: TopicSection[];
};
