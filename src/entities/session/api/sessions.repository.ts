import type { LearningSessionStatus, ResourceType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { LearningSession, SuggestedSessionTopic } from "@/entities/session/model/session";
import type { FinishSessionInput, StartSessionInput } from "@/entities/session/model/session.schemas";

type SessionRecord = {
  id: string;
  status: LearningSessionStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMinutes: number;
  topic: {
    id: string;
    title: string;
    description: string | null;
    estimatedMinutes: number | null;
    nextStep: string | null;
    resources: {
      id: string;
      title: string;
      url: string | null;
      type: ResourceType;
      description: string | null;
      file: {
        fileName: string;
        sizeBytes: number;
      } | null;
    }[];
  } | null;
  path: {
    title: string;
    slug: string;
  };
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatEstimatedTime(minutes: number | null | undefined) {
  return typeof minutes === "number" ? `${minutes} min` : "Not estimated";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapSession(record: SessionRecord): LearningSession {
  const isCompleted = record.status === "COMPLETED";
  const topicTitle = record.topic?.title ?? "Untitled Topic";
  const nextStep = record.topic?.nextStep ?? "Continue the next concrete learning step.";

  return {
    id: record.id,
    topicId: record.topic?.id ?? null,
    topic: topicTitle,
    path: record.path.title,
    pathSlug: record.path.slug,
    status: isCompleted ? "completed" : "in-progress",
    estimatedTime: formatEstimatedTime(record.topic?.estimatedMinutes),
    progress: isCompleted ? 100 : 25,
    progressLabel: isCompleted ? "Session finished" : "Focus started",
    progressDescription: isCompleted
      ? "This session now counts as the completed session for your topic progress."
      : "Session progress tracks this focus block only. Finish the session to add a topic completion signal.",
    description:
      record.topic?.description ??
      "A focused session connected to the current learning path and topic.",
    goal: record.topic?.description ?? `Study ${topicTitle} with focused attention.`,
    nextStep,
    notesPlaceholder: "No notes yet.",
    resources:
      record.topic?.resources.map((resource) => ({
        ...resource,
        source: resource.file ? ("FILE" as const) : ("URL" as const),
        fileName: resource.file?.fileName ?? null,
        sizeLabel: resource.file ? formatFileSize(resource.file.sizeBytes) : null,
      })) ?? [],
    practice: ["Summarize the concept.", "Apply the topic in a small exercise."],
    startedAt: record.startedAt,
    startedAtLabel: formatDateTime(record.startedAt),
    finishedAtLabel: record.finishedAt ? formatDateTime(record.finishedAt) : undefined,
    durationMinutes: record.durationMinutes,
  };
}

export async function getActiveSessionForUser(userEmail: string) {
  const session = await prisma.learningSession.findFirst({
    where: {
      status: "ACTIVE",
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    select: sessionSelect,
  });

  return session ? mapSession(session) : null;
}

export async function listRecentSessionsForUser(userEmail: string) {
  const sessions = await prisma.learningSession.findMany({
    where: {
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 8,
    select: sessionSelect,
  });

  return sessions.map(mapSession);
}

export async function getSessionForUser(userEmail: string, sessionId: string) {
  const session = await prisma.learningSession.findFirst({
    where: {
      id: sessionId,
      user: {
        email: userEmail,
      },
    },
    select: sessionSelect,
  });

  return session ? mapSession(session) : null;
}

export async function getSuggestedSessionTopicForUser(
  userEmail: string,
): Promise<SuggestedSessionTopic | null> {
  const topic = await prisma.topic.findFirst({
    where: {
      path: {
        owner: {
          email: userEmail,
        },
      },
      status: {
        in: ["LEARNING", "NOT_STARTED"],
      },
    },
    orderBy: [{ status: "desc" }, { path: { updatedAt: "desc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      estimatedMinutes: true,
      nextStep: true,
      path: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!topic) {
    return null;
  }

  return {
    id: topic.id,
    title: topic.title,
    path: topic.path.title,
    pathSlug: topic.path.slug,
    estimatedTime: formatEstimatedTime(topic.estimatedMinutes),
    nextStep: topic.nextStep ?? "Start a focused learning session.",
  };
}

export async function startSessionForUser(userEmail: string, input: StartSessionInput) {
  const activeSession = await prisma.learningSession.findFirst({
    where: {
      user: {
        email: userEmail,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (activeSession) {
    throw new Error("Finish your active session before starting a new one.");
  }

  const topic = await prisma.topic.findFirst({
    where: {
      id: input.topicId,
      path: {
        owner: {
          email: userEmail,
        },
      },
    },
    select: {
      id: true,
      pathId: true,
      path: {
        select: {
          slug: true,
          ownerId: true,
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Topic was not found.");
  }

  const session = await prisma.learningSession.create({
    data: {
      userId: topic.path.ownerId,
      pathId: topic.pathId,
      topicId: topic.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      path: {
        select: {
          slug: true,
        },
      },
    },
  });

  return {
    id: session.id,
    pathSlug: session.path.slug,
  };
}

export async function finishSessionForUser(userEmail: string, input: FinishSessionInput) {
  const session = await prisma.learningSession.findFirst({
    where: {
      id: input.sessionId,
      user: {
        email: userEmail,
      },
    },
    select: {
      id: true,
      startedAt: true,
      status: true,
      path: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session was not found.");
  }

  if (session.status !== "ACTIVE") {
    throw new Error("Session is already finished.");
  }

  const finishedAt = new Date();
  const durationMinutes = input.durationMinutes ?? Math.max(
    1,
    Math.round((finishedAt.getTime() - session.startedAt.getTime()) / 60000),
  );

  await prisma.learningSession.update({
    where: {
      id: session.id,
    },
    data: {
      status: "COMPLETED",
      finishedAt,
      durationMinutes,
    },
  });

  return {
    slug: session.path.slug,
  };
}

export async function discardSessionForUser(userEmail: string, sessionId: string) {
  const session = await prisma.learningSession.findFirst({
    where: {
      id: sessionId,
      user: {
        email: userEmail,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!session) {
    throw new Error("Session was not found.");
  }

  if (session.status !== "ACTIVE") {
    throw new Error("Cannot discard a completed session.");
  }

  await prisma.learningSession.delete({
    where: {
      id: session.id,
    },
  });

  return true;
}

const sessionSelect = {
  id: true,
  status: true,
  startedAt: true,
  finishedAt: true,
  durationMinutes: true,
  topic: {
    select: {
      id: true,
      title: true,
      description: true,
      estimatedMinutes: true,
      nextStep: true,
      resources: {
        select: {
          id: true,
          title: true,
          url: true,
          type: true,
          description: true,
          file: {
            select: {
              fileName: true,
              sizeBytes: true,
            },
          },
        },
      },
    },
  },
  path: {
    select: {
      title: true,
      slug: true,
    },
  },
} as const;
