import type {
  PracticeTaskDifficulty as PrismaPracticeTaskDifficulty,
  PracticeTaskStatus as PrismaPracticeTaskStatus,
  PracticeAttemptResult as PrismaPracticeAttemptResult,
} from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type {
  CreatePracticeTaskInput,
  RecordPracticeAttemptInput,
  UpdatePracticeTaskStatusInput,
} from "@/entities/practice-task/model/practice.schemas";
import type {
  PracticeAttemptResult,
  PracticeTaskDifficulty,
  PracticeTaskPreview,
  PracticeTaskStatus,
  PracticeTopicOption,
} from "@/entities/practice-task/model/practice-task";

type PracticeTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: PrismaPracticeTaskStatus;
  difficulty: PrismaPracticeTaskDifficulty;
  estimatedMinutes: number | null;
  topic: {
    title: string;
    path: {
      title: string;
      slug: string;
    };
  };
  attempts: Array<{
    result: PrismaPracticeAttemptResult;
    reflection: string | null;
    createdAt: Date;
  }>;
};

const prismaToUiStatus: Record<PrismaPracticeTaskStatus, PracticeTaskStatus> = {
  TODO: "not-started",
  IN_PROGRESS: "in-progress",
  DONE: "completed",
};

const uiToPrismaStatus: Record<PracticeTaskStatus, PrismaPracticeTaskStatus> = {
  "not-started": "TODO",
  "in-progress": "IN_PROGRESS",
  completed: "DONE",
};

const uiToPrismaDifficulty: Record<PracticeTaskDifficulty, PrismaPracticeTaskDifficulty> = {
  Foundation: "FOUNDATION",
  Intermediate: "INTERMEDIATE",
  Applied: "APPLIED",
};

const prismaToUiDifficulty: Record<PrismaPracticeTaskDifficulty, PracticeTaskDifficulty> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  APPLIED: "Applied",
};

const uiToPrismaAttemptResult: Record<PracticeAttemptResult, PrismaPracticeAttemptResult> = {
  success: "SUCCESS",
  partial: "PARTIAL",
  failed: "FAILED",
};

const prismaToUiAttemptResult: Record<PrismaPracticeAttemptResult, PracticeAttemptResult> = {
  SUCCESS: "success",
  PARTIAL: "partial",
  FAILED: "failed",
};

function formatEstimatedTime(minutes: number | null) {
  return typeof minutes === "number" ? `${minutes} min` : "Not estimated";
}

function mapPracticeTask(record: PracticeTaskRecord): PracticeTaskPreview {
  const description =
    record.description ?? "Applied work connected to this learning topic and path.";
  const attempts = record.attempts ?? [];
  const successfulAttempts = attempts.filter(
    (attempt) => attempt.result === "SUCCESS" || attempt.result === "PARTIAL",
  ).length;
  const latestAttempt = attempts[0];

  return {
    id: record.id,
    title: record.title,
    linkedPath: record.topic.path.title,
    linkedTopic: record.topic.title,
    description,
    instruction: description,
    status: prismaToUiStatus[record.status],
    difficulty: prismaToUiDifficulty[record.difficulty],
    estimatedTime: formatEstimatedTime(record.estimatedMinutes),
    tags: [record.topic.path.title, record.topic.title],
    attemptSummary: {
      total: attempts.length,
      successful: successfulAttempts,
      latestResult: latestAttempt ? prismaToUiAttemptResult[latestAttempt.result] : undefined,
      latestReflection: latestAttempt?.reflection ?? undefined,
    },
  };
}

export async function listPracticeTasksForUser(
  userEmail: string,
): Promise<PracticeTaskPreview[]> {
  const query = {
    where: {
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: practiceTaskSelect,
  } as const;
  const tasks = await findPracticeTasksWithAttemptFallback(query);

  return tasks.map(mapPracticeTask);
}

export async function listRecentPracticeTasksForUser(
  userEmail: string,
  take = 5,
): Promise<PracticeTaskPreview[]> {
  const query = {
    where: {
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take,
    select: practiceTaskSelect,
  } as const;
  const tasks = await findPracticeTasksWithAttemptFallback(query);

  return tasks.map(mapPracticeTask);
}

export async function listPracticeTasksByTopicForUser(
  userEmail: string,
  topicId: string,
): Promise<PracticeTaskPreview[]> {
  const query = {
    where: {
      topicId,
      user: {
        email: userEmail,
      },
      topic: {
        path: {
          owner: {
            email: userEmail,
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: practiceTaskSelect,
  } as const;
  const tasks = await findPracticeTasksWithAttemptFallback(query);

  return tasks.map(mapPracticeTask);
}

export async function listPracticeTopicOptionsForUser(
  userEmail: string,
): Promise<PracticeTopicOption[]> {
  const topics = await prisma.topic.findMany({
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
    orderBy: [{ path: { updatedAt: "desc" } }, { order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      path: {
        select: {
          title: true,
        },
      },
    },
  });

  return topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    pathTitle: topic.path.title,
  }));
}

export async function createPracticeTaskForUser(
  userEmail: string,
  input: CreatePracticeTaskInput,
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
          ownerId: true,
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Topic was not found.");
  }

  const task = await prisma.practiceTask.create({
    data: {
      userId: topic.path.ownerId,
      topicId: topic.id,
      title: input.title,
      description: input.description,
      difficulty: uiToPrismaDifficulty[input.difficulty],
      estimatedMinutes: input.estimatedMinutes,
    },
    select: {
      id: true,
    },
  });

  return {
    id: task.id,
    pathSlug: topic.path.slug,
    topicId: topic.id,
  };
}

export async function updatePracticeTaskStatusForUser(
  userEmail: string,
  input: UpdatePracticeTaskStatusInput,
) {
  const task = await prisma.practiceTask.findFirst({
    where: {
      id: input.taskId,
      user: {
        email: userEmail,
      },
      topic: {
        path: {
          owner: {
            email: userEmail,
          },
        },
      },
    },
    select: {
      id: true,
      topicId: true,
      topic: {
        select: {
          path: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error("Practice task was not found.");
  }

  await prisma.practiceTask.update({
    where: {
      id: task.id,
    },
    data: {
      status: uiToPrismaStatus[input.status],
    },
  });

  return {
    pathSlug: task.topic.path.slug,
    topicId: task.topicId,
  };
}

export async function recordPracticeAttemptForUser(
  userEmail: string,
  input: RecordPracticeAttemptInput,
) {
  const task = await prisma.practiceTask.findFirst({
    where: {
      id: input.taskId,
      user: {
        email: userEmail,
      },
      topic: {
        path: {
          owner: {
            email: userEmail,
          },
        },
      },
    },
    select: {
      id: true,
      userId: true,
      topicId: true,
      topic: {
        select: {
          path: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error("Practice task was not found.");
  }

  const status: PrismaPracticeTaskStatus =
    input.result === "success" ? "DONE" : "IN_PROGRESS";

  await prisma.$transaction([
    prisma.practiceAttempt.create({
      data: {
        taskId: task.id,
        userId: task.userId,
        result: uiToPrismaAttemptResult[input.result],
        reflection: input.reflection,
      },
    }),
    prisma.practiceTask.update({
      where: {
        id: task.id,
      },
      data: {
        status,
      },
    }),
  ]);

  return {
    pathSlug: task.topic.path.slug,
    topicId: task.topicId,
  };
}

const practiceTaskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  difficulty: true,
  estimatedMinutes: true,
  topic: {
    select: {
      title: true,
      path: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  },
  attempts: {
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      result: true,
      reflection: true,
      createdAt: true,
    },
  },
} as const;

const practiceTaskSelectWithoutAttempts = {
  id: true,
  title: true,
  description: true,
  status: true,
  difficulty: true,
  estimatedMinutes: true,
  topic: {
    select: {
      title: true,
      path: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  },
} as const;

type PracticeTaskFindManyQuery = Omit<
  Parameters<typeof prisma.practiceTask.findMany>[0],
  "select"
> & {
  select: typeof practiceTaskSelect;
};

async function findPracticeTasksWithAttemptFallback(query: PracticeTaskFindManyQuery) {
  try {
    return await prisma.practiceTask.findMany(query);
  } catch (error) {
    if (!isMissingPracticeAttemptsTable(error)) {
      throw error;
    }

    const fallbackQuery = { ...query };
    const tasks = await prisma.practiceTask.findMany({
      ...fallbackQuery,
      select: practiceTaskSelectWithoutAttempts,
    });

    return tasks.map((task) => ({
      ...task,
      attempts: [],
    }));
  }
}

function isMissingPracticeAttemptsTable(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("practice_attempts") ||
      error.message.includes("Unknown field `attempts`"))
  );
}
