import { afterEach, beforeEach } from "vitest";

function useTransactions<
  T extends { $queryRaw: (query: TemplateStringsArray) => Promise<any> }
>(prisma: T) {
  beforeEach(async () => {
    await prisma.$queryRaw`BEGIN;`;
  });

  afterEach(async () => {
    await prisma.$queryRaw`ROLLBACK;`;
  });
}

export { useTransactions };
