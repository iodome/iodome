import { createTemplateDatabase } from "@iodome/prisma/playwright";
import { execSync } from "child_process";

export default async function globalTeardown() {
  if (process.env.IODOME_BUILD && !process.env.CI) {
    if (process.env.IODOME_DEBUG) {
      console.log("pnpm build");
      console.time("Build time");
    }
    execSync("pnpm build");
    if (process.env.IODOME_DEBUG) {
      console.timeEnd("Build time");
    }
  }
  await createTemplateDatabase();
}
