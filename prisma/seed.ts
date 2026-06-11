import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://ordo:ordo@localhost:5432/ordo_dev";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const demoLearningPaths = [
  {
    slug: "frontend-engineering",
    title: "Frontend Engineering",
    description: "Modern interface foundations, React patterns, browser APIs, and UI systems.",
  },
  {
    slug: "computer-science-fundamentals",
    title: "Computer Science Fundamentals",
    description: "Core algorithms, data structures, systems thinking, and problem solving.",
  },
  {
    slug: "english-for-it",
    title: "English for IT",
    description: "Technical vocabulary, writing clarity, interviews, and communication practice.",
  },
];

const frontendTopicTree = [
  {
    title: "HTML",
    children: [
      {
        title: "Semantic HTML",
        description: "Use meaningful document structure, landmarks, and accessible page regions.",
        estimatedMinutes: 45,
        nextStep: "Study semantic page structure and landmark regions.",
        status: "LEARNING" as const,
      },
      {
        title: "Forms",
        description: "Build clear form structures with labels, constraints, and usable feedback.",
        estimatedMinutes: 50,
        nextStep: "Review form validation and input grouping patterns.",
        status: "NOT_STARTED" as const,
      },
      {
        title: "Accessibility",
        description: "Understand keyboard navigation, names, roles, and core WCAG expectations.",
        estimatedMinutes: 60,
        nextStep: "Map common accessibility checks to everyday UI work.",
        status: "REVIEW_LATER" as const,
      },
    ],
  },
  {
    title: "CSS",
    children: [
      {
        title: "Flexbox",
        description: "Use one-dimensional layout for alignment and resilient UI rows.",
        estimatedMinutes: 40,
        nextStep: "Compare common flex layouts and alignment strategies.",
        status: "COMPLETED" as const,
      },
      {
        title: "Grid",
        description: "Design two-dimensional layout systems for product screens.",
        estimatedMinutes: 55,
        nextStep: "Build a roadmap grid with stable tracks and responsive constraints.",
        status: "NOT_STARTED" as const,
      },
    ],
  },
  {
    title: "JavaScript",
    children: [
      {
        title: "Async Programming",
        description: "Understand promises, async/await, event loop basics, and request flow.",
        estimatedMinutes: 55,
        nextStep: "Trace a fetch request from loading state to rendered data.",
        status: "NOT_STARTED" as const,
      },
    ],
  },
  {
    title: "React",
    children: [
      {
        title: "React Components",
        description: "Structure reusable UI through composition and clear ownership boundaries.",
        estimatedMinutes: 65,
        nextStep: "Compare prop drilling, composition, and shared layout primitives.",
        status: "NOT_STARTED" as const,
      },
    ],
  },
];

async function main() {
  const passwordHash = await hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: {
      email: "demo@ordo.app",
    },
    update: {
      name: "Demo Learner",
      passwordHash,
    },
    create: {
      email: "demo@ordo.app",
      name: "Demo Learner",
      passwordHash,
    },
    select: {
      id: true,
    },
  });

  const seededPaths = [];

  for (const learningPath of demoLearningPaths) {
    const seededPath = await prisma.learningPath.upsert({
      where: {
        ownerId_slug: {
          ownerId: demoUser.id,
          slug: learningPath.slug,
        },
      },
      update: {
        title: learningPath.title,
        description: learningPath.description,
      },
      create: {
        ownerId: demoUser.id,
        slug: learningPath.slug,
        title: learningPath.title,
        description: learningPath.description,
      },
    });

    seededPaths.push(seededPath);
  }

  const frontendPath = seededPaths.find((path) => path.slug === "frontend-engineering");
  const computerSciencePath = seededPaths.find(
    (path) => path.slug === "computer-science-fundamentals",
  );

  if (frontendPath) {
    await prisma.learningSession.deleteMany({
      where: {
        userId: demoUser.id,
        pathId: frontendPath.id,
      },
    });

    await prisma.topic.deleteMany({
      where: {
        pathId: frontendPath.id,
      },
    });

    let completedSessionTopicId: string | undefined;
    const frontendTopics = new Map<string, string>();

    for (const [sectionIndex, section] of frontendTopicTree.entries()) {
      const rootTopic = await prisma.topic.create({
        data: {
          pathId: frontendPath.id,
          title: section.title,
          order: sectionIndex,
          depth: 0,
          status: "NOT_STARTED",
        },
      });

      for (const [topicIndex, topic] of section.children.entries()) {
        const createdTopic = await prisma.topic.create({
          data: {
            pathId: frontendPath.id,
            parentId: rootTopic.id,
            title: topic.title,
            description: topic.description,
            order: topicIndex,
            depth: 1,
            status: topic.status,
            estimatedMinutes: topic.estimatedMinutes,
            nextStep: topic.nextStep,
          },
        });

        frontendTopics.set(topic.title, createdTopic.id);

        if (topic.title === "Flexbox") {
          completedSessionTopicId = createdTopic.id;
        }
      }
    }

    if (completedSessionTopicId) {
      const startedAt = new Date(Date.now() - 1000 * 60 * 55);
      const finishedAt = new Date(Date.now() - 1000 * 60 * 15);

      await prisma.learningSession.create({
        data: {
          userId: demoUser.id,
          pathId: frontendPath.id,
          topicId: completedSessionTopicId,
          status: "COMPLETED",
          startedAt,
          finishedAt,
          durationMinutes: 40,
        },
      });
    }

    await createDemoNote({
      userId: demoUser.id,
      topicId: frontendTopics.get("Semantic HTML"),
      title: "Semantic HTML notes",
      content:
        "Semantic structure makes page regions understandable for browsers, assistive technology, and future maintainers. Start with landmarks, then use sections only when the content has a clear heading.",
    });

    await createDemoNote({
      userId: demoUser.id,
      topicId: frontendTopics.get("React Components"),
      title: "React architecture notes",
      content:
        "Component boundaries should follow ownership and behavior. Shared primitives stay separate from feature-specific UI, and composition should carry layout decisions before state is introduced.",
    });

    await createDemoNote({
      userId: demoUser.id,
      topicId: frontendTopics.get("Flexbox"),
      title: "Flexbox layout notes",
      content:
        "Flexbox is strongest for one-dimensional alignment. Use it for rows, toolbars, and resilient spacing before reaching for grid.",
    });

    await createDemoPracticeTask({
      userId: demoUser.id,
      topicId: frontendTopics.get("Semantic HTML"),
      title: "Build semantic landing structure",
      description:
        "Create a clear landing page skeleton using header, nav, main, section, article, and footer before styling.",
      status: "IN_PROGRESS",
      difficulty: "FOUNDATION",
      estimatedMinutes: 25,
    });

    await createDemoPracticeTask({
      userId: demoUser.id,
      topicId: frontendTopics.get("Forms"),
      title: "Create accessible form",
      description:
        "Build a small form with labels, grouped fields, helper text, and usable validation feedback.",
      status: "TODO",
      difficulty: "FOUNDATION",
      estimatedMinutes: 30,
    });

    const flexboxPracticeTaskId = await createDemoPracticeTask({
      userId: demoUser.id,
      topicId: frontendTopics.get("Flexbox"),
      title: "Rebuild layout with Flexbox",
      description:
        "Recreate a stable toolbar and content row using flex alignment, wrapping, and spacing constraints.",
      status: "DONE",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 35,
    });

    await createDemoPracticeAttempt({
      userId: demoUser.id,
      taskId: flexboxPracticeTaskId,
      result: "SUCCESS",
      reflection:
        "Flex alignment felt clear after rebuilding the toolbar and testing wrapping behavior.",
    });

    await createDemoPracticeTask({
      userId: demoUser.id,
      topicId: frontendTopics.get("React Components"),
      title: "Refactor component tree",
      description:
        "Split a large UI component into smaller components with clear ownership and composition boundaries.",
      status: "TODO",
      difficulty: "APPLIED",
      estimatedMinutes: 45,
    });

    await createDemoResource({
      userId: demoUser.id,
      topicId: frontendTopics.get("Semantic HTML"),
      title: "MDN Semantic HTML Guide",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html",
      type: "ARTICLE",
      description: "Official developer glossary entry for HTML document semantics and standards.",
    });

    await createDemoResource({
      userId: demoUser.id,
      topicId: frontendTopics.get("Semantic HTML"),
      title: "W3C Page Structure Guide",
      url: "https://www.w3.org/WAI/tutorials/page-structure/",
      type: "WEBSITE",
      description: "Official accessibility guidelines and structural page markup tutorials.",
    });

    await createDemoInboxItem({
      userId: demoUser.id,
      title: "HTML document outline article",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories",
      type: "ARTICLE",
      description: "Review before assigning it to Semantic HTML or Accessibility.",
    });

    await createDemoTopicProgress({
      userId: demoUser.id,
      topicId: frontendTopics.get("Flexbox"),
    });
  }

  if (computerSciencePath) {
    await prisma.topic.deleteMany({
      where: {
        pathId: computerSciencePath.id,
      },
    });

    const algorithmsTopic = await prisma.topic.create({
      data: {
        pathId: computerSciencePath.id,
        title: "Algorithms",
        order: 0,
        depth: 0,
        status: "NOT_STARTED",
      },
    });

    const graphTraversalTopic = await prisma.topic.create({
      data: {
        pathId: computerSciencePath.id,
        parentId: algorithmsTopic.id,
        title: "Graph Traversal",
        description: "Explore graphs with breadth-first and depth-first traversal strategies.",
        order: 0,
        depth: 1,
        status: "NOT_STARTED",
        estimatedMinutes: 55,
        nextStep: "Compare BFS and DFS on the same small graph.",
      },
    });

    await createDemoNote({
      userId: demoUser.id,
      topicId: graphTraversalTopic.id,
      title: "Graph traversal summary",
      content:
        "BFS explores by distance from the start node. DFS follows depth first and is useful for dependency, reachability, and backtracking problems.",
    });
  }
}

async function createDemoResource({
  userId,
  topicId,
  title,
  url,
  type = "WEBSITE",
  description,
}: {
  userId: string;
  topicId: string | undefined;
  title: string;
  url: string;
  type?: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE";
  description?: string;
}) {
  if (!topicId) {
    return;
  }

  await prisma.resource.create({
    data: {
      userId,
      topicId,
      source: "URL",
      title,
      url,
      type,
      description,
    },
  });
}

async function createDemoInboxItem({
  userId,
  title,
  url,
  type,
  description,
}: {
  userId: string;
  title: string;
  url: string;
  type: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE";
  description?: string;
}) {
  await prisma.learningInboxItem.create({
    data: {
      userId,
      title,
      source: "URL",
      type,
      url,
      description,
    },
  });
}

async function createDemoNote({
  userId,
  topicId,
  title,
  content,
}: {
  userId: string;
  topicId: string | undefined;
  title: string;
  content: string;
}) {
  if (!topicId) {
    return;
  }

  await prisma.knowledgeDocument.create({
    data: {
      userId,
      topicId,
      title,
      content,
    },
  });
}

async function createDemoPracticeTask({
  userId,
  topicId,
  title,
  description,
  status,
  difficulty,
  estimatedMinutes,
}: {
  userId: string;
  topicId: string | undefined;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  difficulty: "FOUNDATION" | "INTERMEDIATE" | "APPLIED";
  estimatedMinutes: number;
}) {
  if (!topicId) {
    return undefined;
  }

  const task = await prisma.practiceTask.create({
    data: {
      userId,
      topicId,
      title,
      description,
      status,
      difficulty,
      estimatedMinutes,
    },
    select: {
      id: true,
    },
  });

  return task.id;
}

async function createDemoPracticeAttempt({
  userId,
  taskId,
  result,
  reflection,
}: {
  userId: string;
  taskId: string | undefined;
  result: "SUCCESS" | "PARTIAL" | "FAILED";
  reflection?: string;
}) {
  if (!taskId) {
    return;
  }

  await prisma.practiceAttempt.create({
    data: {
      userId,
      taskId,
      result,
      reflection,
    },
  });
}

async function createDemoTopicProgress({
  userId,
  topicId,
}: {
  userId: string;
  topicId: string | undefined;
}) {
  if (!topicId) {
    return;
  }

  await prisma.topicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId,
      },
    },
    update: {
      state: "COMPLETED",
      completedAt: new Date(),
    },
    create: {
      userId,
      topicId,
      state: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

main()
  .finally(async () => {
     await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
