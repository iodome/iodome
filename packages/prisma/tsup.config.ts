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

  // Playwright bundle
  {
    entry: ["src/playwright/index.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/playwright",
    bundle: true, // This resolves all imports
    external: ["@playwright/test", "@prisma/client"], // Keep peer deps external
  },
]);
