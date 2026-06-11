export type LearningPathPreview = {
  id: string;
  title: string;
  description: string;
  progress: number;
  topicCount: number;
  lastActivity: string;
  focus: string;
};

export const mockLearningPaths: LearningPathPreview[] = [
  {
    id: "frontend-engineering",
    title: "Frontend Engineering",
    description: "Modern interface foundations, React patterns, browser APIs, and UI systems.",
    progress: 35,
    topicCount: 12,
    lastActivity: "2 days ago",
    focus: "React architecture",
  },
  {
    id: "computer-science-fundamentals",
    title: "Computer Science Fundamentals",
    description: "Core algorithms, data structures, systems thinking, and problem solving.",
    progress: 72,
    topicCount: 18,
    lastActivity: "Yesterday",
    focus: "Graph traversal",
  },
  {
    id: "english-for-it",
    title: "English for IT",
    description: "Technical vocabulary, writing clarity, interviews, and communication practice.",
    progress: 0,
    topicCount: 9,
    lastActivity: "Not started",
    focus: "Foundation",
  },
];
