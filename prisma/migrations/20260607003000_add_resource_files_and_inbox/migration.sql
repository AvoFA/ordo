-- AlterEnum
ALTER TYPE "ResourceType" ADD VALUE IF NOT EXISTS 'DOCX';
ALTER TYPE "ResourceType" ADD VALUE IF NOT EXISTS 'PPTX';
ALTER TYPE "ResourceType" ADD VALUE IF NOT EXISTS 'IMAGE';

-- CreateEnum
CREATE TYPE "InboxItemStatus" AS ENUM ('CAPTURED', 'ASSIGNED', 'DISCARDED');

-- CreateTable
CREATE TABLE "learning_inbox_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "source" "ResourceSource" NOT NULL DEFAULT 'URL',
    "type" "ResourceType" NOT NULL DEFAULT 'WEBSITE',
    "url" TEXT,
    "description" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "storageKey" TEXT,
    "status" "InboxItemStatus" NOT NULL DEFAULT 'CAPTURED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_inbox_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_inbox_items_userId_idx" ON "learning_inbox_items"("userId");

-- CreateIndex
CREATE INDEX "learning_inbox_items_topicId_idx" ON "learning_inbox_items"("topicId");

-- AddForeignKey
ALTER TABLE "learning_inbox_items" ADD CONSTRAINT "learning_inbox_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_inbox_items" ADD CONSTRAINT "learning_inbox_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
