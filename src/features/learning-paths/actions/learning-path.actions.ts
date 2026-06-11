"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";
import { createLearningPathForUser } from "@/entities/learning-path/api/learning-paths.repository";
import { createLearningPathSchema } from "@/entities/learning-path/model/learning-path.schemas";

export type ActionState = {
  error?: string;
};

export type CreateLearningPathState = ActionState & {
  success?: boolean;
  redirectUrl?: string;
};

export async function createLearningPathAction(
  _previousState: CreateLearningPathState,
  formData: FormData,
): Promise<CreateLearningPathState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createLearningPathSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const learningPath = await createLearningPathForUser(userEmail, parsed.data);
    return {
      success: true,
      redirectUrl: `/learning-paths/${learningPath.slug}`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create learning path." };
  }
}

export async function updateLearningPathAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("pathId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!id || !title) {
    return { error: "Path ID and Title are required." };
  }

  try {
    const updated = await prisma.learningPath.update({
      where: {
        id,
        owner: { email: userEmail }
      },
      data: {
        title,
        description: description || null
      }
    });

    revalidatePath("/learning-paths");
    revalidatePath(`/learning-paths/${updated.slug}`);
    revalidatePath("/");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update learning path." };
  }

  return {};
}

export async function deleteLearningPathAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("pathId") as string;

  if (!id) {
    return { error: "Path ID is required." };
  }

  try {
    await prisma.learningPath.delete({
      where: {
        id,
        owner: { email: userEmail }
      }
    });

    revalidatePath("/learning-paths");
    revalidatePath("/");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete learning path." };
  }

  redirect("/learning-paths");
}
