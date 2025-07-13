import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    exclude: [
      "./**/node_modules/**",
      "./**/dist/**",
      "./**/e2e/**",
      "./**/.{idea,git,cache,output,temp}/**",
      "./**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ],
    setupFiles: "vitest.setup.ts",
  },
});
