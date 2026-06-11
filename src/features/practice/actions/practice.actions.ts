"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";
import type { PracticeTaskDifficulty, PracticeTaskStatus } from "@prisma/client";
import {
  createPracticeTaskForUser,
  recordPracticeAttemptForUser,
  updatePracticeTaskStatusForUser,
} from "@/entities/practice-task/api/practice.repository";
import {
  createPracticeTaskSchema,
  recordPracticeAttemptSchema,
  updatePracticeTaskStatusSchema,
} from "@/entities/practice-task/model/practice.schemas";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export type PracticeActionState = ActionState;

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : undefined;
}

const fallbackError = "Unable to update practice.";

export async function createPracticeTaskAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createPracticeTaskSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    description: getOptionalString(formData.get("description")),
    difficulty: formData.get("difficulty"),
    estimatedMinutes: getOptionalString(formData.get("estimatedMinutes")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const task = await createPracticeTaskForUser(userEmail, parsed.data);
    revalidatePath("/practice");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${task.pathSlug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function updatePracticeTaskStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = updatePracticeTaskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const task = await updatePracticeTaskStatusForUser(userEmail, parsed.data);
    revalidatePath("/practice");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${task.pathSlug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return {};
}

export async function recordPracticeAttemptAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = recordPracticeAttemptSchema.safeParse({
    taskId: formData.get("taskId"),
    result: formData.get("result"),
    reflection: getOptionalString(formData.get("reflection")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const task = await recordPracticeAttemptForUser(userEmail, parsed.data);
    revalidatePath("/");
    revalidatePath("/practice");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${task.pathSlug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function updatePracticeTaskAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("taskId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const rawDifficulty = formData.get("difficulty") as string;
  let difficulty: PracticeTaskDifficulty = "FOUNDATION";
  if (rawDifficulty) {
    const upperDiff = rawDifficulty.toUpperCase();
    if (upperDiff === "FOUNDATION" || upperDiff === "INTERMEDIATE" || upperDiff === "APPLIED") {
      difficulty = upperDiff as PracticeTaskDifficulty;
    }
  }
  const estimatedMinutesVal = formData.get("estimatedMinutes");
  const estimatedMinutes = estimatedMinutesVal ? parseInt(estimatedMinutesVal as string, 10) : null;
  const rawStatus = formData.get("status") as string;
  let status: PracticeTaskStatus = "TODO";
  if (rawStatus) {
    const upperStatus = rawStatus.toUpperCase().replace("-", "_");
    if (upperStatus === "TODO" || upperStatus === "IN_PROGRESS" || upperStatus === "DONE") {
      status = upperStatus as PracticeTaskStatus;
    }
  }

  if (!id || !title) {
    return { error: "Task ID and Title are required." };
  }

  try {
    const task = await prisma.practiceTask.findFirst({
      where: {
        id,
        user: { email: userEmail }
      },
      select: {
        id: true,
        topic: { select: { path: { select: { slug: true } } } }
      }
    });

    if (!task) {
      return { error: "Practice task not found." };
    }

    await prisma.practiceTask.update({
      where: { id: task.id },
      data: {
        title,
        description: description || null,
        difficulty: difficulty || "FOUNDATION",
        estimatedMinutes: estimatedMinutes || null,
        status: status || "TODO"
      }
    });

    revalidatePath("/practice");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${task.topic.path.slug}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update task." };
  }

  return {};
}

export async function deletePracticeTaskAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("taskId") as string;

  if (!id) {
    return { error: "Task ID is required." };
  }

  try {
    const task = await prisma.practiceTask.findFirst({
      where: {
        id,
        user: { email: userEmail }
      },
      select: {
        id: true,
        topic: { select: { path: { select: { slug: true } } } }
      }
    });

    if (!task) {
      return { error: "Practice task not found." };
    }

    await prisma.practiceTask.delete({
      where: { id: task.id }
    });

    revalidatePath("/practice");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${task.topic.path.slug}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete task." };
  }

  return {};
}
