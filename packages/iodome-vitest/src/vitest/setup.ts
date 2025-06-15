import { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach } from "vitest";

export default function setupTransactionalVitest(prisma: PrismaClient) {
  beforeEach(async () => {
    await prisma.$queryRaw`BEGIN;`;
  });

  afterEach(async () => {
    await prisma.$queryRaw`ROLLBACK;`;
  });
}
