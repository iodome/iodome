import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    outDir: "dist",
  },

  {
    entry: ["src/playwright/index.ts"],
    format: ["esm"],
    dts: {
      resolve: true,
      entry: ["src/playwright/index.ts"],
    },
    outDir: "dist/playwright",
    bundle: true,
    external: ["@playwright/test", "@prisma/client", "child_process"],
  },
]);
