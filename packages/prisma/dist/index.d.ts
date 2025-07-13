import * as _playwright_test from '@playwright/test';

declare function createTestFixtures<T>(PrismaClientConstructor: new (config?: any) => T): _playwright_test.TestType<_playwright_test.PlaywrightTestArgs & _playwright_test.PlaywrightTestOptions & {
    prisma: T;
}, _playwright_test.PlaywrightWorkerArgs & _playwright_test.PlaywrightWorkerOptions>;

declare function dropDatabases(): Promise<void>;

declare function useTransactions<T extends {
    $queryRaw: (query: TemplateStringsArray) => Promise<any>;
}>(prisma: T): void;

export { createTestFixtures, dropDatabases, useTransactions };
