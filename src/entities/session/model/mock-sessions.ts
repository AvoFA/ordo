export type SessionStatus = "not-started" | "in-progress" | "completed";

export type LearningSessionMock = {
  id: string;
  topic: string;
  path: string;
  status: SessionStatus;
  estimatedTime: string;
  progress: number;
  description: string;
  goal: string;
  nextStep: string;
  notesPlaceholder: string;
  resources: string[];
  practice: string[];
};

export const mockSessions: LearningSessionMock[] = [
  {
    id: "semantic-html-session",
    topic: "Semantic HTML",
    path: "Frontend Engineering",
    status: "in-progress",
    estimatedTime: "45 min",
    progress: 25,
    description:
      "A focused session for understanding semantic page structure and accessibility landmarks.",
    goal: "Understand semantic page structure and accessibility landmarks.",
    nextStep: "Identify semantic sections used on modern websites.",
    notesPlaceholder: "No notes yet.",
    resources: ["MDN Documentation", "HTML Living Standard", "Accessibility Guide"],
    practice: [
      "Create a semantic page structure.",
      "Identify header, main, nav, section, article, footer.",
    ],
  },
];

export function getMockSession(id: string) {
  return mockSessions.find((session) => session.id === id);
}
