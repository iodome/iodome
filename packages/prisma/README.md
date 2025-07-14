<img width="84" height="78" alt="iodome-logo-3" src="https://github.com/user-attachments/assets/69aacbd2-6305-4fac-a842-22637d8b0439" />

# @iodome/prisma

Prisma utilities for complete test data isolation support for Postgres in Playwright and Vitest.
Ensures each test runs with a fresh, isolated database state to prevent test interference and flaky tests.

## Installation

```bash
npm install --save-dev @iodome/prisma
# or
pnpm add -D @iodome/prisma
# or
yarn add -D @iodome/prisma
```

## Features

- 🔒 **Complete test isolation** - Each test runs in its own database state
- ⚡ **Fast execution** - Template databases for Playwright, transactions for Vitest
- 🔄 **Automatic cleanup** - No manual database cleanup needed
- 🏃 **Parallel testing** - Run tests in parallel without conflicts
- 🛠️ **Easy integration** - Works with your existing Prisma setup

## Usage

### Playwright (E2E Testing)

#### 1. Create test fixtures

```typescript
// tests/fixtures.ts
import { PrismaClient } from "@prisma/client";
import { createTestFixtures } from "@iodome/prisma/playwright";

export const test = createTestFixtures(PrismaClient);
```

#### 2. Set up global hooks

```typescript
// global.setup.ts
import { createTemplateDatabase } from "@iodome/prisma/playwright";

export default async function globalSetup() {
  // Create a template database for faster test initialization
  await createTemplateDatabase();
}
```

```typescript
// global.teardown.ts
import { dropDatabases } from "@iodome/prisma/playwright";

export default async function globalTeardown() {
  // Clean up all test databases
  await dropDatabases();
}
```

#### 3. Configure Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: "./tests/e2e/global.setup.ts", // path to setup file
  globalTeardown: "./tests/e2e/global.teardown.ts", // path to teardown file
  // ...
});
```

#### 4. Write tests

```typescript
// tests/example.spec.ts
import { test } from "./fixtures";
import { expect } from "@playwright/testing";

test("create and verify user", async ({ page, prisma }) => {
  // Create test data with isolated Prisma client pointing
  // to an unique database per test
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
    },
  });

  // Test your application
  await page.goto("/users");
  await expect(page.getByText(user.name)).toBeVisible();
});
```

### Vitest (Unit/Integration Testing)

#### 1. Set up test isolation

```typescript
// vitest.setup.ts
import prisma from "@/prisma/db";
import { wrapTestsInTransactions } from "@iodome/prisma/vitest";

wrapTestsInTransactions(prisma);
/* wraps tests in transactions using
beforeEach, afterEach from vitest /*
```

#### 2. Configure Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // ... other config
  },
});
```

#### 3. Write tests

```typescript
// tests/actions/articles.test.ts
import prisma from "@/prisma/db";
import { describe, it, expect } from "vitest";
import { getComments } from "../actions/articles";

describe("getComments", () => {
  it("returns comments for an article in descending order", async () => {
    const article = await prisma.article.create({
      data: {
        title: "title",
        content: "content",
      },
    });
    const firstComment = await prisma.comment.create({
      data: {
        content: "first comment",
        articleId: article.id,
        authorId: user.id,
      },
    }); // ... secondComment, thirdComment

    const comments = await getComments(article.id);

    expect(comments).toStrictEqual([thirdComment, secondComment, firstComment]);
  });
});
```

## How It Works

### Playwright Mode

- Creates a separate PostgreSQL database for each test (pattern: `iodome_test_[testId]`)
- Uses a template database for fast initialization
- Automatically starts a test server with isolated database
- Cleans up databases after tests complete

### Vitest Mode

- Wraps each test in a PostgreSQL transaction
- Automatically rolls back all changes after each test
- Much faster than creating separate databases
- Perfect for unit and integration tests

## Configuration

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required for Playwright)
- `IODOME_DEBUG` - Enable query logging
- `CI` or `IODOME_BUILD` - Use production server command instead of dev - better for running large amounts of tests.

### Database Requirements

- PostgreSQL (tested with versions 12+)
- Default connection: `postgres://postgres:postgres@localhost:5432`

## API Reference

### Playwright

#### `createTestFixtures(PrismaClientConstructor)`

Creates Playwright test fixtures with an isolated database.

**Returns:** Extended test object with fixtures:

- `prisma` - Isolated PrismaClient instance pointing to your isolated database
- `baseURL` - URL of the test server
- All standard Playwright fixtures (page, context, etc.)

#### `createTemplateDatabase()`

Creates a template database for faster test initialization. Call in global setup.

#### `dropDatabases()`

Removes all test databases. Call in global teardown.

### Vitest

#### `wrapTestsInTransactions(prismaClient)`

Enables transaction-based test isolation. Call once in setup file.

**Parameters:**

- `prismaClient` - Your configured PrismaClient instance

## Best Practices

1. **Playwright**: Always use global setup/teardown for template database management
2. **Vitest**: Call `wrapTestsInTransactions()` once in your setup file
3. **Performance**: Use template databases for Playwright tests with complex schemas

## Troubleshooting

### Tests are slow

- For Playwright: Ensure you're using `createTemplateDatabase()` in global setup
- For Vitest: Verify transactions are enabled with `wrapTestsInTransactions()`

### Database not found errors

- Check your PostgreSQL server is running
- Ensure your PostgreSQL user has CREATE DATABASE permissions

### Tests are flaking

- This is more likely to happen when running large amounts of tests using playwright. Using a production-like server (i.e. `next start`) instead of a dev server (i.e. `next dev`) is much more reliable and will use far less resources on your machine. The tradeoff is that you'll have to run your build (i.e. `next build`) before running your test.

I have found that using dev servers is faster for test-driven development where I'm rerunning a single test, and using production servers is better when running my test suite locally or in CI. Due to the amount of resources used by spinning up a lot of dev servers in parallel, flakiness becomes more of an issue.

Using production servers on my local machine, I was able to run `600` playwright tests across `12` workers with consistent success. This will vary from machine to machine.

## License

MIT © Michael (fundefined)
