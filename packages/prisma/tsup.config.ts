import { defineConfig } from "tsup";

export default defineConfig([
  // Main package bundle
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    outDir: "dist",
  },
  // Playwright utilities bundle
  {
    entry: ["src/playwright/index.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/playwright",
    bundle: true,
    external: [
      "@playwright/test",
      "@prisma/client",
      "child_process",
      "node:child_process",
      "node:process",
    ],
  },
]);
