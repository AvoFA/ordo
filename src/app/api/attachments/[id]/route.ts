import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "../../../../../auth";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const attachment = await prisma.documentAttachment.findUnique({
      where: { id },
      include: { document: { select: { user: { select: { email: true } } } } }
    });

    if (!attachment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (attachment.document.user.email !== userEmail) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Base64 looks like: data:image/png;base64,iVBORw0K...
    // We need to extract the base64 part
    const matches = attachment.base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return new NextResponse("Invalid image data", { status: 500 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      return new NextResponse("Unsupported image type", { status: 415 });
    }

    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=86400"
      }
    });
  } catch (error) {
    console.error("Failed to serve attachment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
