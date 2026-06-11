"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";

export type ActionState = {
  error?: string;
};

export async function createDocumentVersionAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) redirect("/sign-in");

  const documentId = formData.get("documentId") as string;
  const content = formData.get("content") as string;

  if (!documentId || !content) return { error: "Document ID and Content are required." };

  try {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id: documentId, user: { email: userEmail } }
    });
    if (!doc) return { error: "Document not found." };

    await prisma.knowledgeDocumentVersion.create({
      data: { documentId, content }
    });
    return {};
  } catch (error) {
    console.error("createDocumentVersionAction error:", error);
    return { error: "Failed to create version." };
  }
}

export async function getVersionsAction(documentId: string) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return { error: "Unauthorized" };

  try {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id: documentId, user: { email: userEmail } }
    });
    if (!doc) return { error: "Document not found" };

    const versions = await prisma.knowledgeDocumentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, content: true }
    });

    return { versions };
  } catch (error) {
    console.error("getVersionsAction error:", error);
    return { error: "Failed to fetch versions." };
  }
}

export async function restoreDocumentVersionAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) redirect("/sign-in");

  const versionId = formData.get("versionId") as string;

  if (!versionId) return { error: "Version ID is required." };

  try {
    const version = await prisma.knowledgeDocumentVersion.findUnique({
      where: { id: versionId },
      include: { document: { select: { userId: true, content: true, topic: { select: { path: { select: { slug: true } } } } } } }
    });

    if (!version) return { error: "Version not found." };
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (version.document.userId !== user?.id) return { error: "Unauthorized." };

    // Auto-save the CURRENT content as a new snapshot version before replacing it
    if (version.document.content) {
      await prisma.knowledgeDocumentVersion.create({
        data: {
          documentId: version.documentId,
          content: version.document.content
        }
      });
    }

    await prisma.knowledgeDocument.update({
      where: { id: version.documentId },
      data: { content: version.content }
    });

    revalidatePath("/notes");
    revalidatePath(`/learning-paths/${version.document.topic.path.slug}`);
    return {};
  } catch (error) {
    console.error("restoreDocumentVersionAction error:", error);
    return { error: "Failed to restore version." };
  }
}
