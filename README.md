# iodome

A testing framework for Next.js applications that provides transactional test isolation using Playwright and Vitest.

## Overview

Iodome enables isolated testing for full-stack Next.js applications by providing transactional test wrappers that automatically rollback database changes after each test. This ensures tests run in complete isolation without affecting your development database.

## Packages

This monorepo contains the following packages:

- **@iodome/playwright** - Playwright test fixtures and utilities for E2E testing with transaction isolation
- **@iodome/vitest** - Vitest setup for unit/integration testing with transaction support
- **iodome-test-next** - Example Next.js application demonstrating Iodome usage

## Key Features

- 🔄 Automatic transaction rollback after each test
- 🎭 Custom Playwright fixtures for E2E testing
- 🧪 Vitest integration for unit testing
- 🔒 Complete test isolation
- 📦 TypeScript support
- 🏗️ Prisma ORM integration

## Installation

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build
```

## Usage

### Playwright E2E Tests

```typescript
import { test, expect } from '@iodome/playwright';

test('creates a new article', async ({ page }) => {
  // Your test code here - all database changes will be rolled back
});
```

### Vitest Unit Tests

```typescript
import { setupTransactionalVitest } from '@iodome/vitest';

// Setup in your vitest config
setupTransactionalVitest(prisma);
```

## Example Application

The `packages/iodome-test-next` directory contains a full example Next.js application with:

- Authentication flows
- Article CRUD operations
- Comment system
- E2E and unit test examples

## Development

This project uses:

- pnpm workspaces for monorepo management
- TypeScript for type safety
- Changesets for versioning
- Prisma for database management

## License

MIT
