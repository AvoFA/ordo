"use server";

import { auth } from "../../../../auth";
import { prisma } from "@/shared/lib/prisma";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getBase64Payload(dataUrl: string) {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    data: match[2],
  };
}

export async function uploadAttachmentAction(
  formData: FormData
): Promise<{ error?: string; attachmentId?: string }> {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return { error: "Unauthorized" };

  const documentId = formData.get("documentId") as string;
  const fileName = formData.get("fileName") as string;
  const mimeType = formData.get("mimeType") as string;
  const base64Data = formData.get("base64Data") as string;

  if (!documentId || !mimeType || !base64Data) {
    return { error: "Missing required fields." };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are supported." };
  }

  const payload = getBase64Payload(base64Data);
  if (!payload || payload.mimeType !== mimeType) {
    return { error: "Invalid image data." };
  }

  const fileSize = Buffer.byteLength(payload.data, "base64");
  if (fileSize > MAX_ATTACHMENT_BYTES) {
    return { error: "Image must be smaller than 2 MB." };
  }

  try {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id: documentId, user: { email: userEmail } }
    });
    if (!doc) return { error: "Document not found." };

    const attachment = await prisma.documentAttachment.create({
      data: { documentId, fileName, mimeType, base64Data }
    });

    return { attachmentId: attachment.id };
  } catch (error) {
    console.error("uploadAttachmentAction error:", error);
    return { error: "Failed to upload attachment." };
  }
}
