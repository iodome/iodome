// src/setup.ts
import { afterEach, beforeEach } from "vitest";
function setupTransactionalVitest(prisma) {
  beforeEach(async () => {
    await prisma.$queryRaw`BEGIN;`;
  });
  afterEach(async () => {
    await prisma.$queryRaw`ROLLBACK;`;
  });
}
export {
  setupTransactionalVitest
};
