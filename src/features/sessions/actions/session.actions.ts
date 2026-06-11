"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  finishSessionForUser,
  startSessionForUser,
  discardSessionForUser,
} from "@/entities/session/api/sessions.repository";
import {
  finishSessionSchema,
  startSessionSchema,
} from "@/entities/session/model/session.schemas";

export type SessionActionState = {
  error?: string;
  success?: boolean;
};

export async function startSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = startSessionSchema.safeParse({
    topicId: formData.get("topicId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to start session." };
  }

  let learningSession: Awaited<ReturnType<typeof startSessionForUser>>;

  try {
    learningSession = await startSessionForUser(userEmail, parsed.data);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to start session.",
    };
  }

  revalidatePath("/");
  revalidatePath("/sessions");
  revalidatePath(`/learning-paths/${learningSession.pathSlug}`);
  redirect(`/sessions/${learningSession.id}`);
}

export async function finishSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = finishSessionSchema.safeParse({
    sessionId: formData.get("sessionId"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to finish session." };
  }

  try {
    const learningSession = await finishSessionForUser(userEmail, parsed.data);
    revalidatePath("/");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${learningSession.slug}`);
    revalidatePath(`/sessions/${parsed.data.sessionId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to finish session.",
    };
  }

  return { success: true };
}

export async function discardSessionAction(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = finishSessionSchema.safeParse({
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to discard session." };
  }

  try {
    await discardSessionForUser(userEmail, parsed.data.sessionId);
    revalidatePath("/");
    revalidatePath("/sessions");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to discard session.",
    };
  }

  redirect("/sessions");
}
