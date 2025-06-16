import { test as base, TestInfo } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import TestServer from "./server";

function url(testId: string): string {
  const id = testId.replace("-", "_");
  return (process.env.DATABASE_URL as string).replace("?", `_${id}?`);
}

export const test = base.extend<{ prisma: PrismaClient }>({
  baseURL: [
    async ({}, use, testInfo) => {
      const { testId } = testInfo;
      const server = new TestServer(testId);
      await server.setup();
      await use(`http://127.0.0.1:${server.port}`);
    },
    { scope: "test", timeout: 30000 },
  ],
  prisma: [
    async ({}, use: any, testInfo: TestInfo) => {
      const { testId } = testInfo;
      const prisma = new PrismaClient({
        datasources: { db: { url: url(testId) } },
        log: process.env.DEBUG ? ["query", "info", "warn", "error"] : [],
      });
      await use(prisma);
    },
    { scope: "test" },
  ],
});

export { expect } from "@playwright/test";
