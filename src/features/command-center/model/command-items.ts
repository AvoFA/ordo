export type CommandIconKey =
  | "analytics"
  | "book"
  | "file"
  | "home"
  | "layers"
  | "notes"
  | "play"
  | "settings"
  | "target";

export type CommandItemKind =
  | "context"
  | "path"
  | "topic"
  | "session"
  | "note"
  | "practice"
  | "navigation";

export type CommandCenterItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: CommandItemKind;
  icon: CommandIconKey;
  shortcut?: string;
};

export type CommandCenterGroup = {
  id: string;
  label: string;
  items: CommandCenterItem[];
};

export const navigationCommandGroup: CommandCenterGroup = {
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
};
