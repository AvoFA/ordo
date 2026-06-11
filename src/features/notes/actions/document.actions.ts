"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";

export type ActionState = {
  error?: string;
};

export async function updateNoteAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("noteId") as string;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!id || !content) {
    return { error: "Note ID and Content are required." };
  }

  try {
    const note = await prisma.knowledgeDocument.findFirst({
      where: {
        id,
        user: { email: userEmail }
      },
      select: {
        id: true,
        topic: { select: { path: { select: { slug: true } } } }
      }
    });

    if (!note) {
      return { error: "Note not found." };
    }

    await prisma.knowledgeDocument.update({
      where: { id: note.id },
      data: {
        title: title || null,
        content
      }
    });

    revalidatePath("/notes");
    revalidatePath(`/learning-paths/${note.topic.path.slug}`);
    revalidatePath("/sessions");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update note." };
  }

  return {};
}

export async function deleteNoteAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const id = formData.get("noteId") as string;

  if (!id) {
    return { error: "Note ID is required." };
  }

  try {
    const note = await prisma.knowledgeDocument.findFirst({
      where: {
        id,
        user: { email: userEmail }
      },
      select: {
        id: true,
        topic: { select: { path: { select: { slug: true } } } }
      }
    });

    if (!note) {
      return { error: "Note not found." };
    }

    await prisma.knowledgeDocument.delete({
      where: { id: note.id }
    });

    revalidatePath("/notes");
    revalidatePath(`/learning-paths/${note.topic.path.slug}`);
    revalidatePath("/sessions");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete note." };
  }

  return {};
}
