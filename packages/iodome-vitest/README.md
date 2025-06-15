# @iodome/vitest

Vitest integration for Iodome that provides transactional test isolation for
unit and integration testing of Next.js applications.

## Features

- 🔄 **Transaction Isolation** - Each test runs in its own database transaction
- ⚡ **Automatic Rollback** - Database changes are automatically rolled back
  after each test
- 🧪 **No Manual Cleanup** - No need for manual database cleanup in tests
- 🏗️ **Prisma Integration** - Works seamlessly with Prisma ORM
- 🚀 **Fast Execution** - Transaction rollbacks are faster than truncating
  tables

## Installation

```bash npm install @iodome/vitest vitest @prisma/client ```

## Configuration

Create an `iodome.config.ts` file in your project root:

```typescript import type { IodomeConfig } from "@iodome/vitest";

const config: IodomeConfig = { applicationName: "my-app", };

export default config; ```

## Vitest Setup

1. Create a setup file (e.g., `vitest.setup.ts`):

```typescript import { setupTransactionalVitest } from "@iodome/vitest"; import
prisma from "./path/to/your/prisma-client";

setupTransactionalVitest(prisma); ```

2. Configure your `vitest.config.ts`:

```typescript import { defineConfig } from "vitest/config";

export default defineConfig({ test: { setupFiles: ["./vitest.setup.ts"], // Your
other Vitest config }, }); ```

## Writing Tests

With transactional isolation set up, you can write tests that modify the
database without worrying about cleanup:

```typescript import { describe, it, expect } from "vitest"; import {
createUser, getUser } from "./user-service"; import prisma from
"./prisma-client";

describe("User Service", () => { it("creates and retrieves a user", async () =>
{ // Create test data - this will be rolled back automatically const userData =
{ email: "test@example.com", name: "Test User", };

    const user = await createUser(userData);
    expect(user).toMatchObject(userData);

    // Verify the user exists in the database const retrievedUser = await
    getUser(user.id); expect(retrievedUser).toMatchObject(userData);

    // No cleanup needed! Transaction will rollback automatically });

  it("handles duplicate email addresses", async () => { // Create first user
  await prisma.user.create({ data: { email: "duplicate@example.com", name: "User
  1" }, });

    // Attempt to create user with same email await expect( createUser({ email:
    "duplicate@example.com", name: "User 2" })).rejects.toThrow("Email already
    exists");

    // This test's transaction is isolated from the previous test // Both will
    be rolled back independently }); }); ```

## How It Works

1. **Setup Phase**: `setupTransactionalVitest()` registers Vitest hooks
2. **Before Each Test**: Executes `BEGIN;` to start a database transaction
3. **Test Execution**: Your test runs within the transaction context
4. **After Each Test**: Executes `ROLLBACK;` to undo all database changes
5. **Isolation**: Each test starts with a clean database state

## Database Requirements

- **PostgreSQL** database
- **Prisma ORM** for database access
- Database user with transaction privileges
- Properly configured `DATABASE_URL`

## Environment Setup

For test isolation, you typically want a separate test database:

```bash # .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_test" ```

Make sure your test environment loads the test database URL.

## Best Practices

### ✅ Do

- **Test database operations directly** - Use real Prisma queries instead of
  mocks
- **Create test data in each test** - Don't rely on shared setup data
- **Test edge cases** - Transaction isolation makes it safe to test error
  conditions
- **Use factories or helpers** - Create reusable functions for common test data

### ❌ Don't

- **Don't use `afterEach` cleanup** - Transactions handle cleanup automatically
- **Don't share state between tests** - Each test should be independent
- **Don't test in production database** - Always use a separate test database
- **Don't forget the setup file** - Tests won't be isolated without proper
  configuration

## Example Test Patterns

### Testing Server Actions

```typescript import { createArticle } from "@/actions/articles"; import prisma
from "@/prisma/db";

it("creates an article with valid data", async () => { const user = await
prisma.user.create({ data: { email: "author@example.com", name: "Author" }, });

  const result = await createArticle({ title: "Test Article", content: "Test
  content", authorId: user.id, });

  expect(result.success).toBe(true);
  
  const article = await prisma.article.findUnique({ where: { id: result.data.id
  }, });
  
  expect(article?.title).toBe("Test Article"); }); ```

### Testing Complex Queries

```typescript it("returns articles by author with comment counts", async () => {
const author = await prisma.user.create({ data: { email: "author@example.com",
name: "Author" }, });

  const article = await prisma.article.create({ data: { title: "Popular
  Article", content: "Great content", authorId: author.id, }, });

  // Create multiple comments await Promise.all([ prisma.comment.create({ data:
  { content: "Comment 1", articleId: article.id, authorId: author.id }, }),
  prisma.comment.create({ data: { content: "Comment 2", articleId: article.id,
  authorId: author.id }, }), ]);

  const articlesWithCounts = await
  getArticlesByAuthorWithCommentCounts(author.id);
  
  expect(articlesWithCounts[0]).toMatchObject({ title: "Popular Article",
  commentCount: 2, }); }); ```

## Troubleshooting

**Tests not isolated**: Ensure `setupTransactionalVitest()` is called in your
setup file and the setup file is configured in `vitest.config.ts`.

**Transaction errors**: Verify your database user has the necessary permissions
to begin and rollback transactions.

**Slow tests**: Transaction rollbacks should be fast. If tests are slow, check
for expensive database operations or missing indexes.

## API Reference

### Functions

- `setupTransactionalVitest(prisma: PrismaClient)` - Sets up transaction
  isolation for all tests
- `loadConfig()` - Loads the iodome configuration file

### Types

- `IodomeConfig` - Configuration interface requiring `applicationName`
