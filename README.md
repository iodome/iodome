# iodome

A testing framework for [Next.js] applications using [Prisma] that provides
transactional test isolation using [Playwright] and [Vitest].

## Overview

iodome enables isolated testing for full-stack Next.js/Prisma applications by
providing transactional test wrappers that automatically rollback database
changes after each test. This ensures tests run in complete isolation without
affecting your development database.

## Packages

This monorepo contains the following packages:

- **[@iodome/playwright](./packages/iodome-playwright/)** - Playwright
  integration for E2E testing with database isolation
- **[@iodome/vitest](./packages/iodome-vitest/)** - Vitest integration for
  unit/integration testing with transaction isolation
- **[iodome-app-nextjs-prisma](./packages/iodome-app-nextjs-prisma/)** - Example
  Next.js application demonstrating Iodome usage

## Key Features

- 🔄 Automatic transaction rollback after each test
- 🎭 Custom Playwright fixtures for E2E testing
- 🧪 Vitest integration for unit testing
- 🔒 Complete test isolation
- 📦 TypeScript support
- 🏗️ Prisma ORM integration

## Quick Start

### For E2E Testing with Playwright

```bash
npm install @iodome/playwright @playwright/test @prisma/client
```

See the [@iodome/playwright documentation](./packages/iodome-playwright/) for
complete setup instructions.

### For Unit Testing with Vitest

```bash
npm install @iodome/vitest vitest @prisma/client
```

See the [@iodome/vitest documentation](./packages/iodome-vitest/) for complete
setup instructions.

## Example Application

The `packages/iodome-app-nextjs-prisma` directory contains a full example Next.js
application with:

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
