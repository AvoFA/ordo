import { prisma } from "@/shared/lib/prisma";
import type { CreateLearningPathInput } from "@/entities/learning-path/model/learning-path.schemas";
import type {
  LearningPathDetail,
  LearningPathPreview,
} from "@/entities/learning-path/model/learning-path";
import { listTopicSectionsForPath } from "@/entities/topic/api/topics.repository";
import { deriveTopicCompletion } from "@/entities/topic/model/topic-progress";

type LearningPathRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  updatedAt: Date;
  topics: Array<{
    id: string;
    title: string;
    status: "NOT_STARTED" | "LEARNING" | "COMPLETED" | "REVIEW_LATER";
    nextStep: string | null;
    sessions: Array<{
      status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
    }>;
    progressRecords: Array<{
      state: "IN_PROGRESS" | "COMPLETED";
    }>;
    practiceTasks: Array<{
      attempts: Array<{
        result: "SUCCESS" | "PARTIAL" | "FAILED";
      }>;
    }>;
    _count?: {
      knowledgeDocuments: number;
      resources: number;
    };
  }>;
};

function createSlug(title: string) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return baseSlug || "learning-path";
}

function formatLastActivity(updatedAt: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(updatedAt);
}

function mapLearningPath(record: LearningPathRecord): LearningPathPreview {
  const topicCompletions = record.topics.map(mapPathTopicCompletion);
  const completedTopicCount = topicCompletions.filter(
    (completion) => completion.state === "mastered",
  ).length;
  const readyTopicCount = topicCompletions.filter((completion) => completion.canComplete).length;
  const activeTopic =
    record.topics.find((topic, index) => topicCompletions[index]?.state !== "mastered") ??
    record.topics[0];

  let status: "ready-to-start" | "learning" | "needs-review" | "completed" = "ready-to-start";
  if (record.topics.length === 0) {
    status = "ready-to-start";
  } else if (completedTopicCount === record.topics.length) {
    status = "completed";
  } else if (topicCompletions.some((tc) => tc.state === "review-needed")) {
    status = "needs-review";
  } else if (completedTopicCount > 0 || topicCompletions.some((tc) => tc.state !== "not-started")) {
    status = "learning";
  }

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description ?? "A structured path for focused learning.",
    progress:
      record.topics.length > 0 ? Math.round((completedTopicCount / record.topics.length) * 100) : 0,
    topicCount: record.topics.length,
    completedTopicCount,
    readyTopicCount,
    lastActivity: record.topics.length > 0 ? formatLastActivity(record.updatedAt) : "Not started",
    focus: activeTopic?.title ?? "No topics yet",
    nextStep: activeTopic?.nextStep ?? null,
    status,
  };
}

function mapPathTopicCompletion(topic: LearningPathRecord["topics"][number]) {
  const practiceAttempts = topic.practiceTasks.reduce(
    (count, task) => count + task.attempts.length,
    0,
  );
  const successfulPracticeAttempts = topic.practiceTasks.reduce(
    (count, task) =>
      count + task.attempts.filter((attempt) => attempt.result === "SUCCESS").length,
    0,
  );
  const blockedPracticeAttempts = topic.practiceTasks.reduce(
    (count, task) =>
      count +
      task.attempts.filter(
        (attempt) => attempt.result === "PARTIAL" || attempt.result === "FAILED",
      ).length,
    0,
  );

  return deriveTopicCompletion({
    completedSessions: topic.sessions.filter((session) => session.status === "COMPLETED").length,
    knowledgeDocuments: topic._count?.knowledgeDocuments ?? 0,
    resources: topic._count?.resources ?? 0,
    practiceAttempts,
    successfulPracticeAttempts,
    blockedPracticeAttempts,
    hasActiveSession: topic.sessions.some((session) => session.status === "ACTIVE"),
    hasExplicitCompletion: topic.progressRecords.some((progress) => progress.state === "COMPLETED"),
    isLegacyCompleted: topic.status === "COMPLETED",
  });
}

export async function listLearningPathsForUser(userEmail: string): Promise<LearningPathPreview[]> {
  const learningPaths = await prisma.learningPath.findMany({
    where: {
      owner: {
        email: userEmail,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      updatedAt: true,
      topics: {
        select: {
          id: true,
          title: true,
          status: true,
          nextStep: true,
          sessions: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              status: true,
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
          progressRecords: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              state: true,
            },
            take: 1,
          },
          _count: {
            select: {
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
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return learningPaths.map(mapLearningPath);
}

export async function getLearningPathForUser(
  userEmail: string,
  idOrSlug: string,
): Promise<LearningPathDetail | null> {
  const learningPath = await prisma.learningPath.findFirst({
    where: {
      owner: {
        email: userEmail,
      },
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      updatedAt: true,
      topics: {
        select: {
          id: true,
          title: true,
          status: true,
          nextStep: true,
          sessions: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              status: true,
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
          progressRecords: {
            where: {
              user: {
                email: userEmail,
              },
            },
            select: {
              state: true,
            },
            take: 1,
          },
          _count: {
            select: {
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
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!learningPath) {
    return null;
  }

  const sections = await listTopicSectionsForPath(userEmail, learningPath.id);

  return {
    ...mapLearningPath(learningPath),
    sections,
  };
}

export async function createLearningPathForUser(
  userEmail: string,
  input: CreateLearningPathInput,
) {
  const owner = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!owner) {
    throw new Error("Authenticated user was not found.");
  }

  const baseSlug = createSlug(input.title);
  const slug = await createUniqueSlug(owner.id, baseSlug);

  return prisma.learningPath.create({
    data: {
      ownerId: owner.id,
      slug,
      title: input.title,
      description: input.description || null,
    },
    select: {
      slug: true,
    },
  });
}

async function createUniqueSlug(ownerId: string, baseSlug: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.learningPath.findUnique({
      where: {
        ownerId_slug: {
          ownerId,
          slug,
        },
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
