import { prisma } from "@/shared/lib/prisma";
import type {
  AssignInboxItemInput,
  CreateInboxItemInput,
  DiscardInboxItemInput,
} from "@/entities/inbox/model/inbox.schemas";
import type { InboxItemPreview, InboxItemStatus } from "@/entities/inbox/model/inbox";

type InboxRecord = {
  id: string;
  title: string;
  source: "URL" | "MANUAL" | "FILE";
  type: InboxItemPreview["type"];
  url: string | null;
  description: string | null;
  status: "CAPTURED" | "ASSIGNED" | "DISCARDED";
  createdAt: Date;
  topic: {
    title: string;
    path: {
      title: string;
    };
  } | null;
};

const prismaToUiStatus: Record<InboxRecord["status"], InboxItemStatus> = {
  CAPTURED: "captured",
  ASSIGNED: "assigned",
  DISCARDED: "discarded",
};

function formatCapturedAt(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function mapInboxItem(record: InboxRecord): InboxItemPreview {
  return {
    id: record.id,
    title: record.title,
    source: record.source,
    type: record.type,
    url: record.url,
    description: record.description,
    status: prismaToUiStatus[record.status],
    capturedAt: formatCapturedAt(record.createdAt),
    assignedTopic: record.topic?.title,
    assignedPath: record.topic?.path.title,
  };
}

export async function listInboxItemsForUser(userEmail: string): Promise<InboxItemPreview[]> {
  const items = await prisma.learningInboxItem.findMany({
    where: {
      user: {
        email: userEmail,
      },
      status: {
        not: "DISCARDED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: inboxItemSelect,
  });

  return items.map(mapInboxItem);
}

export async function createInboxItemForUser(userEmail: string, input: CreateInboxItemInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("Authenticated user was not found.");
  }

  await prisma.learningInboxItem.create({
    data: {
      userId: user.id,
      title: input.title,
      source: input.source ?? "URL",
      type: input.type ?? "WEBSITE",
      url: input.url,
      description: input.description,
    },
  });
}

export async function assignInboxItemToTopicForUser(
  userEmail: string,
  input: AssignInboxItemInput,
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

  const item = await prisma.learningInboxItem.findFirst({
    where: {
      id: input.itemId,
      userId: topic.path.ownerId,
    },
    select: {
      id: true,
      title: true,
      source: true,
      type: true,
      url: true,
      description: true,
    },
  });

  if (!item) {
    throw new Error("Inbox item was not found.");
  }

  await prisma.$transaction([
    prisma.learningInboxItem.update({
      where: {
        id: item.id,
      },
      data: {
        topicId: topic.id,
        status: "ASSIGNED",
      },
    }),
    prisma.resource.create({
      data: {
        userId: topic.path.ownerId,
        topicId: topic.id,
        title: item.title,
        source: item.source,
        type: item.type,
        url: item.url ?? "",
        description: item.description,
      },
    }),
  ]);

  return {
    pathSlug: topic.path.slug,
  };
}

export async function discardInboxItemForUser(
  userEmail: string,
  input: DiscardInboxItemInput,
) {
  const item = await prisma.learningInboxItem.findFirst({
    where: {
      id: input.itemId,
      user: {
        email: userEmail,
      },
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    throw new Error("Inbox item was not found.");
  }

  await prisma.learningInboxItem.update({
    where: {
      id: item.id,
    },
    data: {
      status: "DISCARDED",
    },
  });
}

const inboxItemSelect = {
  id: true,
  title: true,
  source: true,
  type: true,
  url: true,
  description: true,
  status: true,
  createdAt: true,
  topic: {
    select: {
      title: true,
      path: {
        select: {
          title: true,
        },
      },
    },
  },
} as const;
