import type { TopicStatus as PrismaTopicStatus } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type {
  CompleteTopicInput,
  CreateTopicInput,
  UpdateTopicStatusInput,
} from "@/entities/topic/model/topic.schemas";
import type {
  TopicCompletion,
  TopicPreview,
  TopicSection,
  TopicStatus,
} from "@/entities/topic/model/topic";
import { deriveTopicCompletion } from "@/entities/topic/model/topic-progress";

const maxTopicDepth = 2;

const prismaToUiStatus: Record<PrismaTopicStatus, TopicStatus> = {
  NOT_STARTED: "not-started",
  LEARNING: "in-progress",
  COMPLETED: "completed",
  REVIEW_LATER: "review-later",
};

const uiToPrismaStatus: Record<TopicStatus, PrismaTopicStatus> = {
  "not-started": "NOT_STARTED",
  "in-progress": "LEARNING",
  completed: "COMPLETED",
  "review-later": "REVIEW_LATER",
};

type TopicRecord = {
  id: string;
  parentId: string | null;
  title: string;
  description: string | null;
  order: number;
  depth: number;
  status: PrismaTopicStatus;
  estimatedMinutes: number | null;
  nextStep: string | null;
  sessions?: Array<{
    id: string;
    status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  }>;
  progressRecords?: Array<{
    state: "IN_PROGRESS" | "COMPLETED";
    completedAt: Date | null;
  }>;
  practiceTasks?: Array<{
    status: "TODO" | "IN_PROGRESS" | "DONE";
    attempts: Array<{
      result: "SUCCESS" | "PARTIAL" | "FAILED";
    }>;
  }>;
  _count?: {
    knowledgeDocuments: number;
    resources: number;
  };
};

export type TopicParentOption = {
  id: string;
  title: string;
  depth: number;
};

function formatEstimatedTime(minutes: number | null) {
  return typeof minutes === "number" ? `${minutes} min` : "Not estimated";
}

function formatCompletionDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function mapTopicCompletion(topic: TopicRecord): TopicCompletion {
  const progress = topic.progressRecords?.[0];
  const practiceAttempts =
    topic.practiceTasks?.reduce((count, task) => count + task.attempts.length, 0) ?? 0;
  const successfulPracticeAttempts =
    topic.practiceTasks?.reduce(
      (count, task) =>
        count + task.attempts.filter((attempt) => attempt.result === "SUCCESS").length,
      0,
    ) ?? 0;
  const blockedPracticeAttempts =
    topic.practiceTasks?.reduce(
      (count, task) =>
        count +
        task.attempts.filter(
          (attempt) => attempt.result === "PARTIAL" || attempt.result === "FAILED",
        ).length,
      0,
    ) ?? 0;

  const completion = deriveTopicCompletion({
    completedSessions:
      topic.sessions?.filter((session) => session.status === "COMPLETED").length ?? 0,
    knowledgeDocuments: topic._count?.knowledgeDocuments ?? 0,
    resources: topic._count?.resources ?? 0,
    practiceAttempts,
    successfulPracticeAttempts,
    blockedPracticeAttempts,
    hasActiveSession: topic.sessions?.some((session) => session.status === "ACTIVE"),
    hasExplicitCompletion: progress?.state === "COMPLETED",
    isLegacyCompleted: topic.status === "COMPLETED",
  });

  return {
    ...completion,
    completedAtLabel: progress?.completedAt ? formatCompletionDate(progress.completedAt) : undefined,
  };
}

function mapTopicPreview(topic: TopicRecord): TopicPreview {
  const completion = mapTopicCompletion(topic);
  const activeSession = topic.sessions?.find((session) => session.status === "ACTIVE");

  return {
    id: topic.id,
    title: topic.title,
    description: topic.description ?? "A focused topic inside this learning path.",
    status: completion.isCompleted ? "completed" : prismaToUiStatus[topic.status],
    estimatedTime: formatEstimatedTime(topic.estimatedMinutes),
    estimatedMinutes: topic.estimatedMinutes,
    nextStep: topic.nextStep ?? "Define the next concrete learning step.",
    completion,
    activeSessionId: activeSession?.id,
  };
}

function getCompletedCount(topics: TopicRecord[]) {
  return topics.filter((topic) => mapTopicCompletion(topic).isCompleted).length;
}

function getReadyCount(topics: TopicRecord[]) {
  return topics.filter((topic) => {
    const completion = mapTopicCompletion(topic);
    return completion.canComplete && !completion.isCompleted;
  }).length;
}

function calculateProgress(topics: TopicRecord[]) {
  if (topics.length === 0) {
    return 0;
  }

  const completed = getCompletedCount(topics);
  return Math.round((completed / topics.length) * 100);
}

export function buildTopicSections(topics: TopicRecord[]): TopicSection[] {
  const rootTopics = topics.filter((topic) => topic.parentId === null);
  const childTopics = topics.filter((topic) => topic.parentId !== null);

  return rootTopics.map((rootTopic) => {
    const children = childTopics.filter((topic) => topic.parentId === rootTopic.id);
    const sectionTopics = children.length > 0 ? children : [rootTopic];

    return {
      id: rootTopic.id,
      title: rootTopic.title,
      progress: calculateProgress(sectionTopics),
      completedCount: getCompletedCount(sectionTopics),
      readyCount: getReadyCount(sectionTopics),
      topicCount: sectionTopics.length,
      topics: sectionTopics.map(mapTopicPreview),
    };
  });
}

export async function listTopicSectionsForPath(userEmail: string, pathId: string) {
  const topics = await prisma.topic.findMany({
    where: {
      path: {
        id: pathId,
        owner: {
          email: userEmail,
        },
      },
    },
    orderBy: [{ depth: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      parentId: true,
      title: true,
      description: true,
      order: true,
      depth: true,
      status: true,
      estimatedMinutes: true,
      nextStep: true,
      sessions: {
        where: {
          user: {
            email: userEmail,
          },
        },
        select: {
          id: true,
          status: true,
        },
        take: 10,
        orderBy: {
          startedAt: "desc",
        },
      },
      practiceTasks: {
        where: {
          user: {
            email: userEmail,
          },
        },
        select: {
          status: true,
          attempts: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              result: true,
            },
          },
        },
      },
      progressRecords: {
        where: {
          user: {
            email: userEmail,
          },
        },
        select: {
          state: true,
          completedAt: true,
        },
        take: 1,
      },
      _count: {
        select: {
          sessions: {
            where: {
              status: "COMPLETED",
              user: {
                email: userEmail,
              },
            },
          },
          knowledgeDocuments: {
            where: {
              user: {
                email: userEmail,
              },
            },
          },
          resources: {
            where: {
              user: {
                email: userEmail,
              },
            },
          },
        },
      },
    },
  });

  return buildTopicSections(topics);
}

export async function listTopicParentOptionsForPath(
  userEmail: string,
  pathId: string,
): Promise<TopicParentOption[]> {
  return prisma.topic.findMany({
    where: {
      path: {
        id: pathId,
        owner: {
          email: userEmail,
        },
      },
      depth: {
        lt: maxTopicDepth,
      },
    },
    orderBy: [{ depth: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      depth: true,
    },
  });
}

export async function createTopicForUser(userEmail: string, input: CreateTopicInput) {
  const learningPath = await prisma.learningPath.findFirst({
    where: {
      id: input.pathId,
      owner: {
        email: userEmail,
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!learningPath) {
    throw new Error("Learning path was not found.");
  }

  const parentTopic = input.parentId
    ? await prisma.topic.findFirst({
        where: {
          id: input.parentId,
          pathId: learningPath.id,
          path: {
            owner: {
              email: userEmail,
            },
          },
        },
        select: {
          id: true,
          depth: true,
        },
      })
    : null;

  if (input.parentId && !parentTopic) {
    throw new Error("Parent topic was not found.");
  }

  const depth = parentTopic ? parentTopic.depth + 1 : 0;

  if (depth > maxTopicDepth) {
    throw new Error("Topic tree supports a maximum depth of 3 levels.");
  }

  const siblingCount = await prisma.topic.count({
    where: {
      pathId: learningPath.id,
      parentId: parentTopic?.id ?? null,
    },
  });

  const topic = await prisma.topic.create({
    data: {
      pathId: learningPath.id,
      parentId: parentTopic?.id,
      title: input.title,
      description: input.description || null,
      estimatedMinutes: input.estimatedMinutes,
      nextStep: input.nextStep || null,
      depth,
      order: siblingCount,
    },
  });

  return {
    learningPath,
    topic,
  };
}

export async function updateTopicStatusForUser(
  userEmail: string,
  input: UpdateTopicStatusInput,
) {
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
      path: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Topic was not found.");
  }

  await prisma.topic.update({
    where: {
      id: topic.id,
    },
    data: {
      status: uiToPrismaStatus[input.status],
    },
  });

  return {
    slug: topic.path.slug,
  };
}

export async function completeTopicForUser(userEmail: string, input: CompleteTopicInput) {
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
      path: {
        select: {
          slug: true,
          ownerId: true,
        },
      },
      _count: {
        select: {
          sessions: {
            where: {
              status: "COMPLETED",
              user: {
                email: userEmail,
              },
            },
          },
          resources: {
            where: {
              user: {
                email: userEmail,
              },
            },
          },
          knowledgeDocuments: {
            where: {
              user: {
                email: userEmail,
              },
            },
          },
        },
      },
      practiceTasks: {
        where: {
          user: {
            email: userEmail,
          },
        },
        select: {
          attempts: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              result: true,
            },
          },
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Topic was not found.");
  }

  const practiceAttempts = topic.practiceTasks.reduce(
    (count, task) => count + task.attempts.length,
    0,
  );
  const successfulPracticeAttempts = topic.practiceTasks.reduce(
    (count, task) =>
      count + task.attempts.filter((attempt) => attempt.result === "SUCCESS").length,
    0,
  );

  const canComplete =
    topic._count.sessions > 0 &&
    topic._count.knowledgeDocuments > 0 &&
    topic._count.resources > 0 &&
    practiceAttempts > 0 &&
    successfulPracticeAttempts > 0;

  if (!canComplete) {
    throw new Error(
      "Complete a session, capture knowledge, attach a resource, and solve a practice attempt first.",
    );
  }

  await prisma.$transaction([
    prisma.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: topic.path.ownerId,
          topicId: topic.id,
        },
      },
      update: {
        state: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        userId: topic.path.ownerId,
        topicId: topic.id,
        state: "COMPLETED",
        completedAt: new Date(),
      },
    }),
    prisma.topic.update({
      where: {
        id: topic.id,
      },
      data: {
        status: "COMPLETED",
      },
    }),
  ]);

  return {
    slug: topic.path.slug,
  };
}
