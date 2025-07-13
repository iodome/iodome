// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // re-exports everything
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  bundle: true,
  external: ["@prisma/client", "@playwright/test", "vitest"],
});
