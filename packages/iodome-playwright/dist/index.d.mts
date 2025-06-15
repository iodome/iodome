import * as _playwright_test from '@playwright/test';
export { expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

declare const test: _playwright_test.TestType<_playwright_test.PlaywrightTestArgs & _playwright_test.PlaywrightTestOptions & {
    prisma: PrismaClient;
}, _playwright_test.PlaywrightWorkerArgs & _playwright_test.PlaywrightWorkerOptions>;

declare function globalSetup(): void;

declare function globalTeardown(): Promise<void>;

interface IodomeConfig {
    applicationName: string;
}

export { type IodomeConfig, globalSetup, globalTeardown, test };
