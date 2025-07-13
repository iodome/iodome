import { test as base, TestInfo } from "@playwright/test";
import TestServer from "./server";

function url(testId: string): string {
  const id = testId.replace("-", "_");
  return `postgresql://postgres:postgres@localhost:5432/iodome_test_${id}?schema=public`;
}

export function createTestFixtures<T>(
  PrismaClientConstructor: new (config?: any) => T
) {
  return base.extend<{ prisma: T }>({
    baseURL: [
      async ({}, use, testInfo) => {
        const { testId } = testInfo;
        const server = new TestServer(testId);
        await server.setup();
        await use(`http://127.0.0.1:${server.port}`);
        await server.cleanup();
      },
      { scope: "test", timeout: 30000 },
    ],
    prisma: [
      async ({}, use: any, testInfo: TestInfo) => {
        const { testId } = testInfo;
        const prisma = new PrismaClientConstructor({
          datasources: { db: { url: url(testId) } },
          log: process.env.DEBUG ? ["query", "info", "warn", "error"] : [],
        });
        await use(prisma);
      },
      { scope: "test" },
    ],
  });
}
