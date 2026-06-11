"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { createNoteForUser, toggleReviewLaterForUser } from "@/entities/note/api/notes.repository";
import { createNoteSchema } from "@/entities/note/model/note.schemas";

export type NoteActionState = {
  error?: string;
  success?: boolean;
};

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : undefined;
}

const initialError = "Unable to create note.";

export async function createNoteAction(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createNoteSchema.safeParse({
    topicId: formData.get("topicId"),
    title: getOptionalString(formData.get("title")),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? initialError };
  }

  try {
    const note = await createNoteForUser(userEmail, parsed.data);
    revalidatePath("/notes");
    revalidatePath(`/learning-paths/${note.pathSlug}`);
    revalidatePath("/sessions");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : initialError,
    };
  }

  return { success: true };
}

export async function toggleReviewLaterAction(
  _previousState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const documentId = formData.get("documentId") as string;
  if (!documentId) {
    return { error: "Document ID is required." };
  }

  try {
    const res = await toggleReviewLaterForUser(userEmail, documentId);
    revalidatePath("/notes");
    revalidatePath(`/learning-paths/${res.pathSlug}`);
    revalidatePath("/sessions");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to toggle review status.",
    };
  }

  return {};
}
