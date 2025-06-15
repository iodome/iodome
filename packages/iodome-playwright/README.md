# @iodome/playwright

Playwright integration for iodome that provides transactional test isolation for
end-to-end testing of Next.js applications.

## Features

- 🔄 **Database Isolation** - Each test gets its own PostgreSQL database
- 🎭 **Custom Fixtures** - Pre-configured `page`, `baseURL`, and `prisma`
  fixtures
- 🚀 **Auto Server Management** - Automatically starts/stops Next.js servers for
  each test
- 🧹 **Automatic Cleanup** - Test databases are cleaned up after test completion
- ⚡ **Fast Setup** - Optimized for quick test startup and teardown

## Installation

`bash npm install @iodome/playwright @playwright/test @prisma/client `

## Configuration

Create an `iodome.config.ts` file in your project root:

````typescript import type { IodomeConfig } from "@iodome/playwright";

const config: IodomeConfig = { applicationName: "my-app", // Used for test
database naming };

export default config; ```

## Playwright Setup

Configure your `playwright.config.ts`:

```typescript import { defineConfig } from "@playwright/test"; import {
globalSetup, globalTeardown } from "@iodome/playwright";

export default defineConfig({ testDir: "./tests/e2e", globalSetup,
globalTeardown, use: { // Your Playwright config }, }); ```

## Writing Tests

Import the extended `test` and `expect` from `@iodome/playwright`:

```typescript import { test, expect } from "@iodome/playwright";

test("creates a new article", async ({ page, prisma, baseURL }) => { // Create
test data using the isolated database const user = await prisma.user.create({
data: { email: "test@example.com", name: "Test User", }, });

  // Navigate to your application (running on isolated server) await
  page.goto(baseURL);

  // Your test interactions await page.getByRole("button", { name: "Create
  Article" }).click(); await expect(page.getByText("Article
  created")).toBeVisible();

  // Verify in database const article = await prisma.article.findFirst({ where:
  { authorId: user.id }, }); expect(article).toBeTruthy(); }); ```

## Available Fixtures

### `page`

Standard Playwright page fixture for browser interactions.

### `baseURL`

The URL of your isolated test server. Each test gets its own Next.js server
instance running on a unique port.

### `prisma`

A PrismaClient instance connected to your test's isolated database. Use this to
set up test data and verify results.

## How It Works

1. **Global Setup**: Builds your Next.js application once before all tests
2. **Per-Test Isolation**:
   - Creates a unique PostgreSQL database (`{applicationName}_test_{testId}`)
   - Starts a Next.js server connected to the test database
   - Provides fixtures connected to the isolated environment
3. **Automatic Cleanup**: Drops test databases and stops servers after each test
4. **Global Teardown**: Cleans up any remaining test artifacts

## Database Requirements

- **PostgreSQL** must be running and accessible
- The `postgres` user must have database creation privileges
- Your application must use Prisma ORM
- `DATABASE_URL` environment variable must be configured

## Environment Variables

```bash # Your main database URL (will be modified for test databases)
DATABASE_URL="postgresql://user:password@localhost:5432/myapp" ```

During tests, this becomes:
`postgresql://user:password@localhost:5432/myapp_test_abc123`

## Best Practices

1. **Keep tests independent** - Don't rely on data from other tests
2. **Use the prisma fixture** for test data setup rather than API calls when
possible
3. **Test one feature per test** - Isolated databases make this easy
4. **Clean test data setup** - Create only the data you need for each test

## Troubleshooting

**Port conflicts**: The framework automatically finds free ports, but ensure
your system has available ports in the 3000+ range.

**Database connection issues**: Verify PostgreSQL is running and the
`DATABASE_URL` is correctly configured.

**Build failures**: Ensure your Next.js app builds successfully with `pnpm
build` before running tests.

## API Reference

### Functions

- `globalSetup()` - Builds the Next.js application
- `globalTeardown()` - Cleans up test databases
- `test` - Extended Playwright test with custom fixtures
- `expect` - Standard Playwright expect assertions

### Types

- `IodomeConfig` - Configuration interface requiring `applicationName`
````
