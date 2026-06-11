export type PracticeTaskStatus = "not-started" | "in-progress" | "completed" | "review";
export type PracticeTaskDifficulty = "Foundation" | "Intermediate" | "Applied";

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
};

export const mockPracticeTasks: PracticeTaskPreview[] = [
  {
    id: "semantic-landing-structure",
    title: "Build a semantic landing structure",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Semantic HTML",
    description:
      "Create a clear page skeleton using semantic landmarks before thinking about styling.",
    instruction: "Identify header, main, nav, section, article, and footer in a simple page.",
    status: "in-progress",
    difficulty: "Foundation",
    estimatedTime: "25 min",
    tags: ["HTML", "Accessibility", "Structure"],
  },
  {
    id: "react-component-refactor",
    title: "Refactor a React component into smaller pieces",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Components",
    description:
      "Split a large interface component into smaller boundaries with clearer ownership.",
    instruction:
      "Extract repeated UI pieces and keep feature-specific behavior close to its owner.",
    status: "not-started",
    difficulty: "Intermediate",
    estimatedTime: "40 min",
    tags: ["React", "Composition"],
  },
  {
    id: "bfs-graph-traversal",
    title: "Implement graph traversal using BFS",
    linkedPath: "Computer Science Fundamentals",
    linkedTopic: "Graph Traversal",
    description: "Practice breadth-first traversal and track visited nodes with a queue.",
    instruction: "Implement BFS for an adjacency-list graph and write the traversal order.",
    status: "review",
    difficulty: "Applied",
    estimatedTime: "35 min",
    tags: ["Algorithms", "Graphs"],
  },
  {
    id: "technical-self-introduction",
    title: "Write a technical self-introduction in English",
    linkedPath: "English for IT",
    linkedTopic: "Standup Updates",
    description: "Practice concise professional language for describing your engineering profile.",
    instruction: "Write a 90-second introduction covering role, skills, current focus, and goals.",
    status: "not-started",
    difficulty: "Foundation",
    estimatedTime: "20 min",
    tags: ["English", "Communication"],
  },
];

export function getMockPracticeTaskByTopic(topic: string) {
  return mockPracticeTasks.find((task) => task.linkedTopic === topic);
}
