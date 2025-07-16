---
"@iodome/prisma": patch
---

Simplify playwright setup with built-in global setup/teardown

- Add direct exports for `playwright/global-setup` and `playwright/global-teardown`
- Fix package.json exports condition order (types before require/import)
- Add `.cjs` direct exports for ESM projects
- Update README with both CommonJS and ESM configuration examples
- Built-in global setup/teardown eliminates need for boilerplate files in consumer projects
