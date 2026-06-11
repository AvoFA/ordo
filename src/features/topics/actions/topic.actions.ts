"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";
import type { TopicStatus } from "@prisma/client";
import {
  completeTopicForUser,
  createTopicForUser,
  updateTopicStatusForUser,
} from "@/entities/topic/api/topics.repository";
import {
  completeTopicSchema,
  createTopicSchema,
  updateTopicStatusSchema,
} from "@/entities/topic/model/topic.schemas";

export type ActionState = {
  error?: string;
};

export type TopicActionState = ActionState & {
  newTopicId?: string;
  newTopicTitle?: string;
  newTopicPathTitle?: string;
};

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : undefined;
}

export async function createTopicAction(
  _previousState: TopicActionState,
  formData: FormData,
): Promise<TopicActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createTopicSchema.safeParse({
    pathId: formData.get("pathId"),
    parentId: getOptionalString(formData.get("parentId")),
    title: formData.get("title"),
    description: getOptionalString(formData.get("description")),
    estimatedMinutes: getOptionalString(formData.get("estimatedMinutes")),
    nextStep: getOptionalString(formData.get("nextStep")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the topic and try again." };
  }

  try {
    const { learningPath, topic } = await createTopicForUser(userEmail, parsed.data);
    revalidatePath(`/learning-paths/${learningPath.slug}`);
    revalidatePath("/learning-paths");
    return {
      newTopicId: topic.id,
      newTopicTitle: topic.title,
      newTopicPathTitle: learningPath.title,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create topic.",
    };
  }
}

export async function updateTopicStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = updateTopicStatusSchema.safeParse({
    topicId: formData.get("topicId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the status and try again." };
  }

  try {
    const learningPath = await updateTopicStatusForUser(userEmail, parsed.data);
    revalidatePath(`/learning-paths/${learningPath.slug}`);
    revalidatePath("/learning-paths");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update topic status.",
    };
  }

  return {};
}

export async function completeTopicAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = completeTopicSchema.safeParse({
    topicId: formData.get("topicId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to complete topic." };
  }

  try {
    const learningPath = await completeTopicForUser(userEmail, parsed.data);
    revalidatePath("/");
    revalidatePath("/learning-paths");
    revalidatePath(`/learning-paths/${learningPath.slug}`);
    revalidatePath("/analytics");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to complete topic.",
    };
  }

  return {};
}

export async function updateTopicAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("topicId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const estimatedMinutesVal = formData.get("estimatedMinutes");
  const estimatedMinutes = estimatedMinutesVal ? parseInt(estimatedMinutesVal as string, 10) : null;
  const nextStep = (formData.get("nextStep") as string)?.trim();
  const rawStatus = formData.get("status") as string;
  let status: TopicStatus = "NOT_STARTED";
  if (rawStatus) {
    const upper = rawStatus.toUpperCase().replace("-", "_");
    if (upper === "NOT_STARTED" || upper === "LEARNING" || upper === "COMPLETED" || upper === "REVIEW_LATER") {
      status = upper as TopicStatus;
    }
  }

  if (!id || !title) {
    return { error: "Topic ID and Title are required." };
  }

  try {
    const topic = await prisma.topic.findFirst({
      where: {
        id,
        path: { owner: { email: userEmail } }
      },
      select: {
        id: true,
        path: { select: { slug: true } }
      }
    });

    if (!topic) {
      return { error: "Topic not found." };
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        title,
        description: description || null,
        estimatedMinutes: estimatedMinutes || null,
        nextStep: nextStep || null,
        status: status || "NOT_STARTED"
      }
    });

    revalidatePath(`/learning-paths/${topic.path.slug}`);
    revalidatePath("/learning-paths");
    revalidatePath("/");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update topic." };
  }

  return {};
}

export async function deleteTopicAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("topicId") as string;

  if (!id) {
    return { error: "Topic ID is required." };
  }

  try {
    const topic = await prisma.topic.findFirst({
      where: {
        id,
        path: { owner: { email: userEmail } }
      },
      select: {
        id: true,
        path: { select: { slug: true } }
      }
    });

    if (!topic) {
      return { error: "Topic not found." };
    }

    await prisma.topic.delete({
      where: { id: topic.id }
    });

    revalidatePath(`/learning-paths/${topic.path.slug}`);
    revalidatePath("/learning-paths");
    revalidatePath("/");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete topic." };
  }

  return {};
}
