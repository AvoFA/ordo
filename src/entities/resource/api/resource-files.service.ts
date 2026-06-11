import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type StoredResourceFile = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  publicUrl: string;
  resourceType: "PDF" | "DOCX" | "PPTX" | "IMAGE";
};

const maxFileSizeBytes = 10 * 1024 * 1024;

const allowedFiles: Record<string, { extension: string; resourceType: StoredResourceFile["resourceType"] }> = {
  "application/pdf": { extension: "pdf", resourceType: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
    resourceType: "DOCX",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    extension: "pptx",
    resourceType: "PPTX",
  },
  "image/jpeg": { extension: "jpg", resourceType: "IMAGE" },
  "image/png": { extension: "png", resourceType: "IMAGE" },
  "image/webp": { extension: "webp", resourceType: "IMAGE" },
  "image/gif": { extension: "gif", resourceType: "IMAGE" },
};

export async function storeResourceFile(file: File): Promise<StoredResourceFile> {
  const allowed = allowedFiles[file.type];

  if (!allowed) {
    throw new Error("Only PDF, DOCX, PPTX, and image resources are supported.");
  }

  if (file.size > maxFileSizeBytes) {
    throw new Error("Resource files must stay under 10 MB.");
  }

  const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "resources");
  await mkdir(uploadsDirectory, { recursive: true });

  const storageKey = `${randomUUID()}.${allowed.extension}`;
  const storagePath = path.join(uploadsDirectory, storageKey);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(storagePath, bytes);

  return {
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storageKey,
    publicUrl: `/uploads/resources/${storageKey}`,
    resourceType: allowed.resourceType,
  };
}
