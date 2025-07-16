import { execSync } from "child_process";
import { createTemplateDatabase } from "./setup";

export default async function globalSetup() {
  if (process.env.IODOME_BUILD) {
    execSync("pnpm build");
  }
  
  await createTemplateDatabase();
}