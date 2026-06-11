-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'VIDEO', 'BOOK', 'WEBSITE', 'PDF');
CREATE TYPE "ResourceSource" AS ENUM ('URL', 'MANUAL', 'FILE');

-- AlterTable
ALTER TABLE "resources" ADD COLUMN "type" "ResourceType" NOT NULL DEFAULT 'WEBSITE';
ALTER TABLE "resources" ADD COLUMN "source" "ResourceSource" NOT NULL DEFAULT 'URL';
ALTER TABLE "resources" ADD COLUMN "content" TEXT;
ALTER TABLE "resources" ALTER COLUMN "topicId" DROP NOT NULL;
ALTER TABLE "resources" ALTER COLUMN "url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "resource_files" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT,
    "publicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_files_resourceId_key" ON "resource_files"("resourceId");

-- AddForeignKey
ALTER TABLE "resource_files" ADD CONSTRAINT "resource_files_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
