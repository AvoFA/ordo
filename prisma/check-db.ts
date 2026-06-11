import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const docs = await prisma.knowledgeDocument.findMany({
    take: 5,
    select: { id: true, title: true, reviewLater: true },
  });
  console.log("KnowledgeDocuments in DB:", JSON.stringify(docs, null, 2));

  const resources = await prisma.resource.findMany({
    take: 5,
    select: { id: true, title: true, type: true },
  });
  console.log("Resources in DB:", JSON.stringify(resources, null, 2));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
