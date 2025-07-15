<img width="84" height="78" alt="a spherical terrarium with a a few trees and pushes" src="https://github.com/user-attachments/assets/020a313c-852c-4b6e-824c-197728a7248e" />

# iodome

A monorepo for iodome packages focused on test data isolation.

## Packages

### [@iodome/prisma](./packages/prisma/)

Prisma utilities that provide complete test data isolation for Playwright and Vitest testing. Ensures each test runs with a fresh, isolated database state to prevent test interference and flaky tests.

**Key features:**
- Automatic database transaction rollback after each test
- Parallel test execution with isolated data
- Support for both Playwright and Vitest test runners
- Clean test data management without manual cleanup
