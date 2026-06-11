import { prisma } from "@/shared/lib/prisma";
import type { CreateNoteInput } from "@/entities/note/model/note.schemas";
import type { NotePreview, NoteTopicOption } from "@/entities/note/model/note";

type NoteRecord = {
  id: string;
  title: string | null;
  content: string;
  reviewLater: boolean;
  updatedAt: Date;
  topic: {
    title: string;
    path: {
      title: string;
      slug: string;
    };
  };
};

function formatUpdatedTime(updatedAt: Date) {
  return `Updated ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(updatedAt)}`;
}

function createExcerpt(content: string) {
  // Strip simple markdown for excerpt if possible, or just slice
  const stripped = content.replace(/[#*`>_\-\[\]]/g, "").replace(/\s+/g, " ").trim();
  return stripped.length > 180 ? `${stripped.slice(0, 177).trim()}...` : stripped;
}

function mapNote(record: NoteRecord): NotePreview {
  return {
    id: record.id,
    title: record.title ?? `${record.topic.title} document`,
    linkedPath: record.topic.path.title,
    linkedTopic: record.topic.title,
    excerpt: createExcerpt(record.content),
    content: record.content,
    reviewLater: record.reviewLater,
    updatedTime: formatUpdatedTime(record.updatedAt),
    tags: [record.topic.path.title, record.topic.title],
  };
}

export async function listNotesForUser(userEmail: string): Promise<NotePreview[]> {
  const notes = await prisma.knowledgeDocument.findMany({
    where: {
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: noteSelect,
  });

  return notes.map(mapNote);
}

export async function listRecentNotesForUser(
  userEmail: string,
  take = 5,
): Promise<NotePreview[]> {
  const notes = await prisma.knowledgeDocument.findMany({
    where: {
      user: {
        email: userEmail,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take,
    select: noteSelect,
  });

  return notes.map(mapNote);
}

export async function listNotesByTopicForUser(
  userEmail: string,
  topicId: string,
): Promise<NotePreview[]> {
  const notes = await prisma.knowledgeDocument.findMany({
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
    select: noteSelect,
  });

  return notes.map(mapNote);
}

export async function listNoteTopicOptionsForUser(
  userEmail: string,
): Promise<NoteTopicOption[]> {
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

export async function createNoteForUser(userEmail: string, input: CreateNoteInput) {
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

  const note = await prisma.knowledgeDocument.create({
    data: {
      userId: topic.path.ownerId,
      topicId: topic.id,
      title: input.title,
      content: input.content,
    },
    select: {
      id: true,
    },
  });

  return {
    id: note.id,
    pathSlug: topic.path.slug,
    topicId: topic.id,
  };
}

export async function toggleReviewLaterForUser(userEmail: string, documentId: string) {
  const doc = await prisma.knowledgeDocument.findFirst({
    where: {
      id: documentId,
      user: { email: userEmail },
    },
    select: {
      id: true,
      reviewLater: true,
      topic: {
        select: {
          path: { select: { slug: true } },
        },
      },
    },
  });

  if (!doc) {
    throw new Error("Document not found.");
  }

  await prisma.knowledgeDocument.update({
    where: { id: doc.id },
    data: { reviewLater: !doc.reviewLater },
  });

  return {
    id: doc.id,
    pathSlug: doc.topic.path.slug,
  };
}

const noteSelect = {
  id: true,
  title: true,
  content: true,
  reviewLater: true,
  updatedAt: true,
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
