import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  external: ["@playwright/test", "@prisma/client"],
  outDir: "dist",
  shims: false,
  splitting: false,
  dts: true,
});
