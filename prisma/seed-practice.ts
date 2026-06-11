import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://ordo:ordo@localhost:5432/ordo_dev";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // Find demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@ordo.app" },
    select: { id: true },
  });

  if (!demoUser) {
    console.error("❌ User demo@ordo.app not found. Run `npx prisma db seed` first.");
    process.exit(1);
  }

  // Find all topics for this user
  const topics = await prisma.topic.findMany({
    where: {
      path: { ownerId: demoUser.id },
      depth: 1, // leaf topics only
    },
    select: {
      id: true,
      title: true,
      path: { select: { title: true } },
    },
  });

  const topicMap = new Map(topics.map((t) => [t.title, t.id]));

  console.log("📚 Found topics:", topics.map((t) => t.title).join(", "));

  // Delete existing practice tasks and attempts for clean state
  const existingTasks = await prisma.practiceTask.findMany({
    where: { userId: demoUser.id },
    select: { id: true },
  });
  if (existingTasks.length > 0) {
    await prisma.practiceAttempt.deleteMany({
      where: { taskId: { in: existingTasks.map((t) => t.id) } },
    });
    await prisma.practiceTask.deleteMany({
      where: { userId: demoUser.id },
    });
    console.log(`🗑️  Cleared ${existingTasks.length} existing practice tasks`);
  }

  // Helper
  async function task(opts: {
    topicTitle: string;
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    difficulty: "FOUNDATION" | "INTERMEDIATE" | "APPLIED";
    estimatedMinutes: number;
    attempts?: Array<{ result: "SUCCESS" | "PARTIAL" | "FAILED"; reflection?: string }>;
  }) {
    const topicId = topicMap.get(opts.topicTitle);
    if (!topicId) {
      console.warn(`⚠️  Topic not found: ${opts.topicTitle}`);
      return;
    }

    const created = await prisma.practiceTask.create({
      data: {
        userId: demoUser!.id,
        topicId,
        title: opts.title,
        description: opts.description,
        status: opts.status,
        difficulty: opts.difficulty,
        estimatedMinutes: opts.estimatedMinutes,
      },
      select: { id: true },
    });

    if (opts.attempts && opts.attempts.length > 0) {
      for (const attempt of opts.attempts) {
        await prisma.practiceAttempt.create({
          data: {
            userId: demoUser!.id,
            taskId: created.id,
            result: attempt.result,
            reflection: attempt.reflection,
          },
        });
      }
    }

    console.log(`  ✅ ${opts.status.padEnd(12)} [${opts.difficulty}] ${opts.title}`);
    return created.id;
  }

  console.log("\n🔴 NEEDS REVIEW (failed/partial last attempt)");

  await task({
    topicTitle: "Semantic HTML",
    title: "Build semantic landing page structure",
    description: "Create a full page skeleton using header, nav, main, article, section, and footer. No CSS allowed — focus on document structure only.",
    status: "IN_PROGRESS",
    difficulty: "FOUNDATION",
    estimatedMinutes: 25,
    attempts: [
      { result: "PARTIAL", reflection: "Used section instead of article in several places. Need to review the difference between section and article." },
    ],
  });

  await task({
    topicTitle: "Async Programming",
    title: "Explain the event loop in plain English",
    description: "Without looking at code, describe how the JS event loop works: call stack, task queue, microtask queue. Then draw a simple diagram.",
    status: "IN_PROGRESS",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 20,
    attempts: [
      { result: "FAILED", reflection: "Confused microtasks with macrotasks. Need to re-read and then explain again from scratch." },
    ],
  });

  await task({
    topicTitle: "React Components",
    title: "Identify component boundaries in a UI",
    description: "Take a screenshot of a real app. Draw component boundaries on it. For each, name: what it owns, what it receives as props, and what it renders.",
    status: "IN_PROGRESS",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 30,
    attempts: [
      { result: "PARTIAL", reflection: "Good at identifying leaf components, but struggled with container vs layout components. Need another pass." },
    ],
  });

  console.log("\n🔵 IN PROGRESS (not started / in-progress, no failed attempts)");

  await task({
    topicTitle: "Forms",
    title: "Create accessible login form",
    description: "Build a login form with email + password fields. All inputs must have visible labels, correct input types, and error messaging with aria-describedby.",
    status: "IN_PROGRESS",
    difficulty: "FOUNDATION",
    estimatedMinutes: 30,
  });

  await task({
    topicTitle: "Accessibility",
    title: "Audit a page with only keyboard navigation",
    description: "Open any website. Navigate it using only Tab, Shift+Tab, Enter, and Space. Write down: 3 things that work well, 3 things that are broken or confusing.",
    status: "TODO",
    difficulty: "FOUNDATION",
    estimatedMinutes: 20,
  });

  await task({
    topicTitle: "Grid",
    title: "Recreate a 3-column layout with CSS Grid",
    description: "Build a product card grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Use grid-template-columns with minmax and auto-fill.",
    status: "TODO",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 35,
  });

  await task({
    topicTitle: "Async Programming",
    title: "Write a fetch wrapper with retry logic",
    description: "Create a fetchWithRetry(url, maxRetries) function using async/await. It should retry on network errors up to maxRetries times with exponential backoff.",
    status: "TODO",
    difficulty: "APPLIED",
    estimatedMinutes: 45,
  });

  await task({
    topicTitle: "Graph Traversal",
    title: "Implement BFS from scratch",
    description: "Without looking at notes, implement BFS on an adjacency list graph. Return the traversal order. Then trace through the same graph manually.",
    status: "TODO",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 40,
  });

  await task({
    topicTitle: "React Components",
    title: "Refactor large component into smaller pieces",
    description: "Take the UserDashboard component. Split it so each visual section has its own component with clear props. No prop drilling deeper than 2 levels.",
    status: "TODO",
    difficulty: "APPLIED",
    estimatedMinutes: 50,
  });

  console.log("\n🟢 SECURED (completed with successful attempts)");

  await task({
    topicTitle: "Flexbox",
    title: "Rebuild navigation bar with Flexbox",
    description: "Recreate a responsive navigation: logo left, links center, CTA right. Use flexbox only — no absolute positioning. Must work on mobile too.",
    status: "DONE",
    difficulty: "FOUNDATION",
    estimatedMinutes: 25,
    attempts: [
      { result: "SUCCESS", reflection: "Flex alignment clicked. The key insight: justify-content controls main axis, align-items controls cross axis." },
    ],
  });

  await task({
    topicTitle: "Flexbox",
    title: "Build a card grid with equal heights",
    description: "Create a row of cards where all cards have equal height regardless of content length. Use flexbox stretch behavior.",
    status: "DONE",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 20,
    attempts: [
      { result: "PARTIAL", reflection: "First attempt used fixed height, which broke with long content." },
      { result: "SUCCESS", reflection: "Stretch is the default align-items value — just needed to stop overriding it." },
    ],
  });

  console.log("\n✅ Practice seed complete!");
  console.log(`   ${topics.length} topics found`);
  console.log("   3 tasks in 'Needs Review'");
  console.log("   6 tasks in 'In Progress'");
  console.log("   2 tasks in 'Secured'");
  console.log("\n🔐 Login: demo@ordo.app / password123");
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
