import { prisma } from "@/shared/lib/prisma";
import { listLearningPathsForUser } from "@/entities/learning-path/api/learning-paths.repository";
import { listRecentNotesForUser } from "@/entities/note/api/notes.repository";
import { listRecentPracticeTasksForUser } from "@/entities/practice-task/api/practice.repository";
import { getActiveSessionForUser } from "@/entities/session/api/sessions.repository";
import type {
  CommandCenterGroup,
  CommandCenterItem,
} from "@/features/command-center/model/command-items";
import { navigationCommandGroup } from "@/features/command-center/model/command-items";

export async function getCommandCenterGroupsForUser(
  userEmail: string,
): Promise<CommandCenterGroup[]> {
  const [activeSession, learningPaths, topics, notes, practiceTasks] = await Promise.all([
    getActiveSessionForUser(userEmail),
    listLearningPathsForUser(userEmail),
    listRecentTopicsForCommandCenter(userEmail),
    listRecentNotesForUser(userEmail, 5),
    listRecentPracticeTasksForUser(userEmail, 5),
  ]);

  const currentLearningItems: CommandCenterItem[] = activeSession
    ? [
        {
          id: "current-path",
          title: activeSession.path,
          description: "Open current learning path",
          href: `/learning-paths/${activeSession.pathSlug}`,
          kind: "context",
          icon: "book",
        },
        {
          id: "current-topic",
          title: activeSession.topic,
          description: "Open current session topic",
          href: `/sessions/${activeSession.id}`,
          kind: "context",
          icon: "target",
        },
        {
          id: "continue-session",
          title: "Continue current session",
          description: `${activeSession.progress}% complete / ${activeSession.estimatedTime}`,
          href: `/sessions/${activeSession.id}`,
          kind: "session",
          icon: "play",
          shortcut: "Enter",
        },
      ]
    : [
        {
          id: "no-current-learning",
          title: "No learning context found",
          description: "Start a topic session to create current learning context.",
          href: "/learning-paths",
          kind: "context",
          icon: "layers",
        },
      ];

  const learningPathItems: CommandCenterItem[] = learningPaths.slice(0, 5).map((path) => ({
    id: `path-${path.id}`,
    title: path.title,
    description: `${path.progress}% complete / ${path.topicCount} topics`,
    href: `/learning-paths/${path.slug}`,
    kind: "path",
    icon: "book",
  }));

  const topicItems: CommandCenterItem[] = topics.map((topic) => ({
    id: `topic-${topic.id}`,
    title: topic.title,
    description: `${topic.pathTitle} / ${topic.status}`,
    href: `/learning-paths/${topic.pathSlug}`,
    kind: "topic",
    icon: "target",
  }));

  const noteItems: CommandCenterItem[] = notes.map((note) => ({
    id: `note-${note.id}`,
    title: note.title,
    description: `${note.linkedPath} / ${note.linkedTopic}`,
    href: "/notes",
    kind: "note",
    icon: "notes",
  }));

  const practiceItems: CommandCenterItem[] = practiceTasks.map((task) => ({
    id: `practice-${task.id}`,
    title: task.title,
    description: `${task.linkedTopic} / ${task.estimatedTime}`,
    href: "/practice",
    kind: "practice",
    icon: "target",
  }));

  return [
    {
      id: "current-learning",
      label: "Current Learning",
      items: currentLearningItems,
    },
    {
      id: "learning-paths",
      label: "Learning Paths",
      items: learningPathItems,
    },
    {
      id: "topics",
      label: "Topics",
      items: topicItems,
    },
    {
      id: "notes",
      label: "Notes",
      items: noteItems,
    },
    {
      id: "practice",
      label: "Practice",
      items: practiceItems,
    },
    navigationCommandGroup,
  ].filter((group) => group.items.length > 0);
}

async function listRecentTopicsForCommandCenter(userEmail: string) {
  return prisma.topic.findMany({
    where: {
      path: {
        owner: {
          email: userEmail,
        },
      },
      parentId: {
        not: null,
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 10,
    select: {
      id: true,
      title: true,
      status: true,
      path: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  }).then((topics) =>
    topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      status: topic.status.replace("_", " ").toLowerCase(),
      pathTitle: topic.path.title,
      pathSlug: topic.path.slug,
    })),
  );
}
