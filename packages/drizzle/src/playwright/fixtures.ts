import { test as base, TestInfo } from "@playwright/test";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import TestServer from "../utils/server";

function url(testId: string): string {
  const id = testId.replace("-", "_");
  return `postgresql://postgres:postgres@localhost:5432/iodome_test_${id}?schema=public`;
}

export function createTestFixtures() {
  return base.extend<{ db: NodePgDatabase }>({
    baseURL: [
      async ({}, use, testInfo) => {
        const { testId } = testInfo;
        const server = new TestServer(testId);
        await server.setup();
        await use(`http://127.0.0.1:${server.port}`);
        await server.cleanup();
      },
      { scope: "test", timeout: 30_000 },
    ],
    db: [
      async ({}, use: any, testInfo: TestInfo) => {
        const { testId } = testInfo;
        const db = drizzle(url(testId));
        await use(db);
      },
      { scope: "test", timeout: 30_000 },
    ],
  });
}
