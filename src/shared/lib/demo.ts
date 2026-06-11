import type { LearningPathDetail, LearningPathPreview } from "@/entities/learning-path/model/learning-path";
import type { LearningSession, SuggestedSessionTopic } from "@/entities/session/model/session";
import type { NotePreview, NoteTopicOption } from "@/entities/note/model/note";
import type { PracticeTaskPreview, PracticeTopicOption } from "@/entities/practice-task/model/practice-task";
import type { CommandCenterGroup } from "@/features/command-center/model/command-items";

// Check if Demo Mode is enabled and we are in development
export const isDemoModeActive = () => {
  return process.env.ORDO_DEMO_MODE === "true" && process.env.NODE_ENV === "development";
};

// Safely execute a database operation, falling back to mock data if it fails in Demo Mode
export async function runInDemoMode<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (isDemoModeActive()) {
    try {
      return await operation();
    } catch (error) {
      console.warn("Database query failed in ORDO_DEMO_MODE. Falling back to static mock data.", error);
      return fallback;
    }
  }
  return operation();
}

export const demoPaths: LearningPathPreview[] = [
  {
    id: "frontend-engineering-id",
    slug: "frontend-engineering",
    title: "Frontend Engineering",
    description: "Modern interface foundations, React patterns, browser APIs, and UI systems.",
    progress: 14,
    topicCount: 7,
    lastActivity: "Jun 4",
    focus: "Semantic HTML",
    nextStep: "Study semantic page structure and landmark regions.",
    status: "learning",
  },
  {
    id: "computer-science-fundamentals-id",
    slug: "computer-science-fundamentals",
    title: "Computer Science Fundamentals",
    description: "Core algorithms, data structures, systems thinking, and problem solving.",
    progress: 0,
    topicCount: 2,
    lastActivity: "Not started",
    focus: "Algorithms",
    nextStep: "Compare BFS and DFS on the same small graph.",
    status: "ready-to-start",
  },
  {
    id: "english-for-it-id",
    slug: "english-for-it",
    title: "English for IT",
    description: "Technical vocabulary, writing clarity, interviews, and communication practice.",
    progress: 0,
    topicCount: 0,
    lastActivity: "Not started",
    focus: "No topics yet",
    nextStep: null,
    status: "ready-to-start",
  },
];

export const demoPathDetails: Record<string, LearningPathDetail> = {
  "frontend-engineering": {
    ...demoPaths[0],
    sections: [
      {
        id: "section-html-id",
        title: "HTML",
        progress: 33,
        topics: [
          {
            id: "semantic-html-id",
            title: "Semantic HTML",
            description: "Use meaningful document structure, landmarks, and accessible page regions.",
            status: "in-progress",
            estimatedTime: "45 mins",
            nextStep: "Study semantic page structure and landmark regions.",
            sessionId: "semantic-html-session",
          },
          {
            id: "forms-id",
            title: "Forms",
            description: "Build clear form structures with labels, constraints, and usable feedback.",
            status: "not-started",
            estimatedTime: "50 mins",
            nextStep: "Review form validation and input grouping patterns.",
          },
          {
            id: "accessibility-id",
            title: "Accessibility",
            description: "Understand keyboard navigation, names, roles, and core WCAG expectations.",
            status: "review-later",
            estimatedTime: "60 mins",
            nextStep: "Map common accessibility checks to everyday UI work.",
          },
        ],
      },
      {
        id: "section-css-id",
        title: "CSS",
        progress: 50,
        topics: [
          {
            id: "flexbox-id",
            title: "Flexbox",
            description: "Use one-dimensional layout for alignment and resilient UI rows.",
            status: "completed",
            estimatedTime: "40 mins",
            nextStep: "Compare common flex layouts and alignment strategies.",
            sessionId: "flexbox-session",
          },
          {
            id: "grid-id",
            title: "Grid",
            description: "Design two-dimensional layout systems for product screens.",
            status: "not-started",
            estimatedTime: "55 mins",
            nextStep: "Build a roadmap grid with stable tracks and responsive constraints.",
          },
        ],
      },
      {
        id: "section-javascript-id",
        title: "JavaScript",
        progress: 0,
        topics: [
          {
            id: "async-programming-id",
            title: "Async Programming",
            description: "Understand promises, async/await, event loop basics, and request flow.",
            status: "not-started",
            estimatedTime: "55 mins",
            nextStep: "Trace a fetch request from loading state to rendered data.",
          },
        ],
      },
      {
        id: "section-react-id",
        title: "React",
        progress: 0,
        topics: [
          {
            id: "react-components-id",
            title: "React Components",
            description: "Structure reusable UI through composition and clear ownership boundaries.",
            status: "not-started",
            estimatedTime: "65 mins",
            nextStep: "Compare prop drilling, composition, and shared layout primitives.",
          },
        ],
      },
    ],
  },
  "computer-science-fundamentals": {
    ...demoPaths[1],
    sections: [
      {
        id: "section-algorithms-id",
        title: "Algorithms",
        progress: 0,
        topics: [
          {
            id: "graph-traversal-id",
            title: "Graph Traversal",
            description: "Explore graphs with breadth-first and depth-first traversal strategies.",
            status: "not-started",
            estimatedTime: "55 mins",
            nextStep: "Compare BFS and DFS on the same small graph.",
          },
        ],
      },
    ],
  },
};

export const demoSessions: Record<string, LearningSession> = {
  "semantic-html-session": {
    id: "semantic-html-session",
    topicId: "semantic-html-id",
    topic: "Semantic HTML",
    path: "Frontend Engineering",
    pathSlug: "frontend-engineering",
    status: "in-progress",
    estimatedTime: "45 mins",
    progress: 25,
    progressLabel: "Focus started",
    progressDescription:
      "Session progress tracks this focus block only. Finish the session to add a topic completion signal.",
    description: "Use meaningful document structure, landmarks, and accessible page regions.",
    goal: "Study semantic page structure and landmark regions.",
    nextStep: "Compare headers, sections, and nav elements.",
    notesPlaceholder: "Add notes about semantic elements.",
    resources: [
      {
        id: "mock-res-1",
        title: "MDN Semantic HTML Guide",
        source: "URL",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html",
        type: "WEBSITE",
        description: "Official developer glossary entry for HTML document semantics and standards.",
      },
      {
        id: "mock-res-2",
        title: "W3C Page Structure Guide",
        source: "URL",
        url: "https://www.w3.org/WAI/tutorials/page-structure/",
        type: "WEBSITE",
        description: "Official accessibility guidelines and structural page markup tutorials.",
      },
    ],
    practice: ["Build semantic landing structure"],
    startedAt: new Date(),
    startedAtLabel: "20 mins ago",
    durationMinutes: 45,
  },
  "flexbox-session": {
    id: "flexbox-session",
    topicId: "flexbox-id",
    topic: "Flexbox",
    path: "Frontend Engineering",
    pathSlug: "frontend-engineering",
    status: "completed",
    estimatedTime: "40 mins",
    progress: 100,
    progressLabel: "Session finished",
    progressDescription:
      "This session now counts as the completed-session signal for topic learning.",
    description: "Use one-dimensional layout for alignment and resilient UI rows.",
    goal: "Compare common flex layouts and alignment strategies.",
    nextStep: "Explore CSS Grid for 2D layouts.",
    notesPlaceholder: "",
    resources: [],
    practice: [],
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    startedAtLabel: "2 hours ago",
    durationMinutes: 40,
  },
};

export const demoSuggestedTopic: SuggestedSessionTopic = {
  id: "semantic-html-id",
  title: "Semantic HTML",
  path: "Frontend Engineering",
  pathSlug: "frontend-engineering",
  estimatedTime: "45 mins",
  nextStep: "Study semantic page structure and landmark regions.",
};

export const demoNotes: NotePreview[] = [
  {
    id: "note-1",
    title: "Semantic HTML notes",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Semantic HTML",
    excerpt: "Semantic structure makes page regions understandable for browsers, assistive technology, and future maintainers.",
    content: "Semantic structure makes page regions understandable for browsers, assistive technology, and future maintainers. Start with landmarks, then use sections only when the content has a clear heading.",
    reviewLater: false,
    updatedTime: "Just now",
    tags: ["HTML", "Accessibility"],
  },
  {
    id: "note-2",
    title: "React architecture notes",
    linkedPath: "Frontend Engineering",
    linkedTopic: "React Components",
    excerpt: "Component boundaries should follow ownership and behavior. Shared primitives stay separate from feature-specific UI.",
    content: "Component boundaries should follow ownership and behavior. Shared primitives stay separate from feature-specific UI, and composition should carry layout decisions before state is introduced.",
    reviewLater: true,
    updatedTime: "1 day ago",
    tags: ["React", "Architecture"],
  },
];

export const demoNoteOptions: NoteTopicOption[] = [
  {
    id: "semantic-html-id",
    title: "Semantic HTML",
    pathTitle: "Frontend Engineering",
  },
  {
    id: "react-components-id",
    title: "React Components",
    pathTitle: "Frontend Engineering",
  },
];

export const demoPracticeTasks: PracticeTaskPreview[] = [
  {
    id: "task-1",
    title: "Build semantic landing structure",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Semantic HTML",
    description: "Create a clear landing page skeleton using header, nav, main, section, article, and footer before styling.",
    instruction: "Create a mock layout in an HTML file using at least 5 different landmark elements.",
    status: "in-progress",
    difficulty: "Foundation",
    estimatedTime: "25 mins",
    tags: ["HTML", "Semantics"],
    attemptSummary: {
      total: 1,
      successful: 0,
      latestResult: "failed",
      latestReflection: "Struggled with identifying the main document layout structure.",
    },
  },
  {
    id: "task-2",
    title: "Create accessible form",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Forms",
    description: "Build a small form with labels, grouped fields, helper text, and usable validation feedback.",
    instruction: "Ensure every input has a matching label and helper texts are linked via aria-describedby.",
    status: "not-started",
    difficulty: "Foundation",
    estimatedTime: "30 mins",
    tags: ["HTML", "Forms"],
  },
  {
    id: "task-3",
    title: "Rebuild layout with Flexbox",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Flexbox",
    description: "Recreate a stable toolbar and content row using flex alignment, wrapping, and spacing constraints.",
    instruction: "Implement a flex container with space-between layout that wraps nicely on smaller widths.",
    status: "completed",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["CSS", "Flexbox"],
  },
];

export const demoPracticeOptions: PracticeTopicOption[] = [
  {
    id: "semantic-html-id",
    title: "Semantic HTML",
    pathTitle: "Frontend Engineering",
  },
  {
    id: "forms-id",
    title: "Forms",
    pathTitle: "Frontend Engineering",
  },
];

export const demoCommandGroups: CommandCenterGroup[] = [
  {
    id: "current-learning",
    label: "Current Learning",
    items: [
      {
        id: "current-path",
        title: "Frontend Engineering",
        description: "Open current learning path",
        href: "/learning-paths/frontend-engineering",
        kind: "context",
        icon: "book",
      },
      {
        id: "current-topic",
        title: "Semantic HTML",
        description: "Open current session topic",
        href: "/sessions/semantic-html-session",
        kind: "context",
        icon: "target",
      },
      {
        id: "continue-session",
        title: "Continue current session",
        description: "25% complete / 45 mins",
        href: "/sessions/semantic-html-session",
        kind: "session",
        icon: "play",
        shortcut: "Enter",
      },
    ],
  },
  {
    id: "learning-paths",
    label: "Learning Paths",
    items: [
      {
        id: "path-frontend-engineering-id",
        title: "Frontend Engineering",
        description: "14% complete / 7 topics",
        href: "/learning-paths/frontend-engineering",
        kind: "path",
        icon: "book",
      },
      {
        id: "path-computer-science-fundamentals-id",
        title: "Computer Science Fundamentals",
        description: "0% complete / 2 topics",
        href: "/learning-paths/computer-science-fundamentals",
        kind: "path",
        icon: "book",
      },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    items: [
      {
        id: "nav-today",
        title: "Today",
        description: "Open current learning workspace",
        href: "/",
        kind: "navigation",
        icon: "home",
      },
      {
        id: "nav-learning-paths",
        title: "Learning Paths",
        description: "Browse learning roadmaps",
        href: "/learning-paths",
        kind: "navigation",
        icon: "book",
      },
      {
        id: "nav-sessions",
        title: "Sessions",
        description: "Open session overview",
        href: "/sessions",
        kind: "navigation",
        icon: "play",
      },
      {
        id: "nav-notes",
        title: "Notes",
        description: "Open learning notes",
        href: "/notes",
        kind: "navigation",
        icon: "file",
      },
      {
        id: "nav-practice",
        title: "Practice",
        description: "Open applied learning tasks",
        href: "/practice",
        kind: "navigation",
        icon: "target",
      },
      {
        id: "nav-analytics",
        title: "Analytics",
        description: "Open learning analytics",
        href: "/analytics",
        kind: "navigation",
        icon: "analytics",
      },
      {
        id: "nav-settings",
        title: "Settings",
        description: "Open workspace settings",
        href: "/settings",
        kind: "navigation",
        icon: "settings",
      },
    ],
  },
];
