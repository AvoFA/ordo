import { mockLearningPaths } from "@/entities/learning-path/model/mock-learning-paths";
import type { TopicSection } from "@/entities/topic/model/topic";

export type LearningPathDetail = (typeof mockLearningPaths)[number] & {
  sections: TopicSection[];
};

const frontendSections: TopicSection[] = [
  {
    id: "html",
    title: "HTML",
    progress: 67,
    topics: [
      {
        id: "semantic-html",
        title: "Semantic HTML",
        description: "Use meaningful document structure, landmarks, and accessible page regions.",
        status: "in-progress",
        estimatedTime: "45 min",
        nextStep: "Study semantic page structure and landmark regions.",
        sessionId: "semantic-html-session",
      },
      {
        id: "forms",
        title: "Forms",
        description: "Build clear form structures with labels, constraints, and usable feedback.",
        status: "completed",
        estimatedTime: "50 min",
        nextStep: "Review form validation and input grouping patterns.",
      },
      {
        id: "accessibility",
        title: "Accessibility",
        description: "Understand keyboard navigation, names, roles, and core WCAG expectations.",
        status: "review-later",
        estimatedTime: "60 min",
        nextStep: "Map common accessibility checks to everyday UI work.",
      },
    ],
  },
  {
    id: "css",
    title: "CSS",
    progress: 42,
    topics: [
      {
        id: "flexbox",
        title: "Flexbox",
        description:
          "Use one-dimensional layout for alignment, distribution, and resilient UI rows.",
        status: "completed",
        estimatedTime: "40 min",
        nextStep: "Compare common flex layouts and alignment strategies.",
      },
      {
        id: "grid",
        title: "Grid",
        description:
          "Design two-dimensional layout systems for product screens and content regions.",
        status: "in-progress",
        estimatedTime: "55 min",
        nextStep: "Build a roadmap grid with stable tracks and responsive constraints.",
      },
      {
        id: "responsive-design",
        title: "Responsive Design",
        description:
          "Create interfaces that preserve hierarchy across desktop and smaller screens.",
        status: "not-started",
        estimatedTime: "50 min",
        nextStep: "Define breakpoints around content needs instead of device names.",
      },
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    progress: 30,
    topics: [
      {
        id: "variables",
        title: "Variables",
        description: "Clarify values, references, scope, declarations, and runtime mental models.",
        status: "completed",
        estimatedTime: "35 min",
        nextStep: "Compare const, let, primitive values, and object references.",
      },
      {
        id: "functions",
        title: "Functions",
        description:
          "Use functions to shape program boundaries, reuse behavior, and manage data flow.",
        status: "not-started",
        estimatedTime: "45 min",
        nextStep: "Practice function signatures, return values, and closures.",
      },
      {
        id: "async-programming",
        title: "Async Programming",
        description: "Understand promises, async/await, event loop basics, and request flow.",
        status: "not-started",
        estimatedTime: "55 min",
        nextStep: "Trace a fetch request from loading state to rendered data.",
      },
    ],
  },
  {
    id: "react",
    title: "React",
    progress: 10,
    topics: [
      {
        id: "component-composition",
        title: "Components",
        description:
          "Structure reusable UI through composition, slots, and clear ownership boundaries.",
        status: "not-started",
        estimatedTime: "65 min",
        nextStep: "Compare prop drilling, composition, and shared layout primitives.",
      },
      {
        id: "state-boundaries",
        title: "State Boundaries",
        description: "Separate server state, UI state, derived state, and URL-driven state.",
        status: "review-later",
        estimatedTime: "60 min",
        nextStep: "Identify which state belongs in React Query, Zustand, or component state.",
      },
      {
        id: "effects",
        title: "Effects",
        description: "Use effects deliberately for synchronization with external systems.",
        status: "not-started",
        estimatedTime: "50 min",
        nextStep: "Separate rendering logic from effectful synchronization.",
      },
    ],
  },
];

const csSections: TopicSection[] = [
  {
    id: "algorithms",
    title: "Algorithms",
    progress: 78,
    topics: [
      {
        id: "graph-traversal",
        title: "Graph Traversal",
        description: "Use breadth-first and depth-first search to explore connected structures.",
        status: "in-progress",
        estimatedTime: "55 min",
        nextStep: "Implement BFS and DFS on the same graph and compare traversal order.",
      },
      {
        id: "sorting",
        title: "Sorting",
        description: "Understand common sorting strategies and their tradeoffs.",
        status: "completed",
        estimatedTime: "50 min",
        nextStep: "Review merge sort stability and quicksort partitioning.",
      },
    ],
  },
  {
    id: "data-structures",
    title: "Data Structures",
    progress: 68,
    topics: [
      {
        id: "hash-tables",
        title: "Hash Tables",
        description:
          "Model key-value access, collision strategies, and average-case lookup behavior.",
        status: "completed",
        estimatedTime: "45 min",
        nextStep: "Practice collision handling with separate chaining.",
      },
      {
        id: "trees",
        title: "Trees",
        description: "Work with hierarchical structures, traversal patterns, and search trees.",
        status: "in-progress",
        estimatedTime: "60 min",
        nextStep: "Compare preorder, inorder, and postorder traversal.",
      },
    ],
  },
];

const englishSections: TopicSection[] = [
  {
    id: "communication",
    title: "Communication",
    progress: 0,
    topics: [
      {
        id: "technical-vocabulary",
        title: "Technical Vocabulary",
        description:
          "Build precise vocabulary for frontend, backend, architecture, and collaboration.",
        status: "not-started",
        estimatedTime: "35 min",
        nextStep: "Create a vocabulary list from daily engineering contexts.",
      },
      {
        id: "standup-updates",
        title: "Standup Updates",
        description: "Practice concise updates around progress, blockers, and next work.",
        status: "not-started",
        estimatedTime: "30 min",
        nextStep: "Draft three short updates using real project context.",
      },
    ],
  },
];

const sectionsByPathId: Record<string, TopicSection[]> = {
  "frontend-engineering": frontendSections,
  "computer-science-fundamentals": csSections,
  "english-for-it": englishSections,
};

export const mockLearningPathDetails: LearningPathDetail[] = mockLearningPaths.map((path) => ({
  ...path,
  sections: sectionsByPathId[path.id] ?? [],
}));

export function getMockLearningPathDetail(id: string) {
  return mockLearningPathDetails.find((path) => path.id === id);
}
