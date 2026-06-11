"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  createFileResourceForUser,
  createResourceForUser,
  deleteResourceForUser,
  updateResourceForUser,
} from "@/entities/resource/api/resources.repository";
import { storeResourceFile } from "@/entities/resource/api/resource-files.service";
import {
  createFileResourceSchema,
  createResourceSchema,
  deleteResourceSchema,
  updateResourceSchema,
} from "@/entities/resource/model/resource.schemas";

export type ActionState = {
  error?: string;
  success?: boolean;
};

const fallbackError = "Unable to update resource.";

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : undefined;
}

function revalidateResourcePaths(pathSlug?: string) {
  if (pathSlug) {
    revalidatePath(`/learning-paths/${pathSlug}`);
  }

  revalidatePath("/sessions");
}

export async function createResourceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createResourceSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    source: formData.get("source") ?? "URL",
    type: formData.get("type") ?? "WEBSITE",
    url: getOptionalString(formData.get("url")),
    content: getOptionalString(formData.get("content")),
    description: getOptionalString(formData.get("description")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const resource = await createResourceForUser(userEmail, parsed.data);
    revalidateResourcePaths(resource.pathSlug);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function createFileResourceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = createFileResourceSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    description: getOptionalString(formData.get("description")),
  });
  const fileValue = formData.get("file");

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { error: "Choose a supported resource file." };
  }

  try {
    const storedFile = await storeResourceFile(fileValue);
    const resource = await createFileResourceForUser(userEmail, parsed.data, storedFile);
    revalidateResourcePaths(resource.pathSlug);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function updateResourceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = updateResourceSchema.safeParse({
    resourceId: formData.get("resourceId"),
    title: formData.get("title"),
    source: formData.get("source") ?? "URL",
    type: formData.get("type") ?? "WEBSITE",
    url: getOptionalString(formData.get("url")),
    content: getOptionalString(formData.get("content")),
    description: getOptionalString(formData.get("description")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const resource = await updateResourceForUser(userEmail, parsed.data);
    revalidateResourcePaths(resource.pathSlug);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}

export async function deleteResourceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = deleteResourceSchema.safeParse({
    resourceId: formData.get("resourceId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? fallbackError };
  }

  try {
    const resource = await deleteResourceForUser(userEmail, parsed.data);
    revalidateResourcePaths(resource.pathSlug);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : fallbackError,
    };
  }

  return { success: true };
}
