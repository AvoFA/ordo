"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  assignInboxItemToTopicForUser,
  createInboxItemForUser,
  discardInboxItemForUser,
} from "@/entities/inbox/api/inbox.repository";
import {
  assignInboxItemSchema,
  createInboxItemSchema,
  discardInboxItemSchema,
} from "@/entities/inbox/model/inbox.schemas";

export type InboxActionState = {
  error?: string;
  success?: boolean;
};

const fallbackError = "Unable to update inbox.";

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : undefined;
}

export async function createInboxItemAction(
  _previousState: InboxActionState,
  formData: FormData,
): Promise<InboxActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createInboxItemSchema.safeParse({
    title: formData.get("title"),
    source: formData.get("source") ?? "URL",
    type: formData.get("type") ?? "WEBSITE",
    url: getOptionalString(formData.get("url")),
    description: getOptionalString(formData.get("description")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    await createInboxItemForUser(userEmail, parsed.data);
    revalidatePath("/inbox");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function assignInboxItemAction(
  _previousState: InboxActionState,
  formData: FormData,
): Promise<InboxActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = assignInboxItemSchema.safeParse({
    itemId: formData.get("itemId"),
    topicId: formData.get("topicId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const item = await assignInboxItemToTopicForUser(userEmail, parsed.data);
    revalidatePath("/inbox");
    revalidatePath("/sessions");
    revalidatePath(`/learning-paths/${item.pathSlug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function discardInboxItemAction(
  _previousState: InboxActionState,
  formData: FormData,
): Promise<InboxActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = discardInboxItemSchema.safeParse({
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    await discardInboxItemForUser(userEmail, parsed.data);
    revalidatePath("/inbox");
    revalidatePath("/");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}
