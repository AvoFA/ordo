export type NotePreview = {
  id: string;
  title: string;
  linkedPath: string;
  linkedTopic: string;
  excerpt: string;
  content?: string;
  updatedTime: string;
  tags: string[];
};

export const mockNotes: NotePreview[] = [
  {
    id: "semantic-html-notes",
    title: "Semantic HTML notes",
    linkedPath: "Frontend Engineering",
    linkedTopic: "Semantic HTML",
    excerpt:
      "Semantic structure makes page regions understandable for browsers, assistive technology, and future maintainers.",
    content:
      "Semantic structure makes page regions understandable for browsers, assistive technology, and future maintainers. Make sure to use landmarks appropriately.",
    updatedTime: "Updated today",
    tags: ["HTML", "Accessibility", "Structure"],
  },
  {
    id: "react-architecture-notes",
    title: "React architecture notes",
    linkedPath: "Frontend Engineering",
    linkedTopic: "React architecture",
    excerpt:
      "Component boundaries should follow ownership and behavior. Shared primitives stay separate from feature-specific UI.",
    content:
      "Component boundaries should follow ownership and behavior. Shared primitives stay separate from feature-specific UI.",
    updatedTime: "Updated 2 days ago",
    tags: ["React", "Architecture"],
  },
  {
    id: "graph-traversal-summary",
    title: "Graph traversal summary",
    linkedPath: "Computer Science Fundamentals",
    linkedTopic: "Graph Traversal",
    excerpt:
      "BFS explores by distance from the start node. DFS follows depth first and is useful for dependency and reachability problems.",
    content:
      "BFS explores by distance from the start node. DFS follows depth first and is useful for dependency and reachability problems.",
    updatedTime: "Updated yesterday",
    tags: ["Algorithms", "Graphs"],
  },
];

export function getMockNoteByTopic(topic: string) {
  return mockNotes.find((note) => note.linkedTopic === topic);
}
