import { prisma } from "@/shared/lib/prisma";
import type {
  CreateFileResourceInput,
  CreateResourceInput,
  DeleteResourceInput,
  UpdateResourceInput,
} from "@/entities/resource/model/resource.schemas";
import type { storeResourceFile } from "@/entities/resource/api/resource-files.service";

type StoredResourceFile = Awaited<ReturnType<typeof storeResourceFile>>;

export async function createResourceForUser(userEmail: string, input: CreateResourceInput) {
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

  await prisma.resource.create({
    data: {
      userId: topic.path.ownerId,
      topicId: topic.id,
      title: input.title,
      source: input.source ?? "URL",
      type: input.type ?? "WEBSITE",
      url: input.url ?? "",
      content: input.content,
      description: input.description,
    },
  });

  return {
    pathSlug: topic.path.slug,
  };
}

export async function createFileResourceForUser(
  userEmail: string,
  input: CreateFileResourceInput,
  file: StoredResourceFile,
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

  await prisma.resource.create({
    data: {
      userId: topic.path.ownerId,
      topicId: topic.id,
      title: input.title,
      source: "FILE",
      type: file.resourceType,
      url: file.publicUrl,
      description: input.description,
      file: {
        create: {
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          storageKey: file.storageKey,
          publicUrl: file.publicUrl,
        },
      },
    },
  });

  return {
    pathSlug: topic.path.slug,
  };
}

export async function updateResourceForUser(userEmail: string, input: UpdateResourceInput) {
  const resource = await prisma.resource.findFirst({
    where: {
      id: input.resourceId,
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

  if (!resource) {
    throw new Error("Resource was not found.");
  }

  await prisma.resource.update({
    where: {
      id: resource.id,
    },
    data: {
      title: input.title,
      source: input.source ?? "URL",
      type: input.type ?? "WEBSITE",
      url: input.url ?? "",
      content: input.content,
      description: input.description,
    },
  });

  return {
    pathSlug: resource.topic?.path.slug,
  };
}

export async function deleteResourceForUser(userEmail: string, input: DeleteResourceInput) {
  const resource = await prisma.resource.findFirst({
    where: {
      id: input.resourceId,
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

  if (!resource) {
    throw new Error("Resource was not found.");
  }

  await prisma.resource.delete({
    where: {
      id: resource.id,
    },
  });

  return {
    pathSlug: resource.topic?.path.slug,
  };
}
