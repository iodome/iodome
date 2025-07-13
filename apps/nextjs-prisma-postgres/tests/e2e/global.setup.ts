import { createTemplateDatabase } from "@iodome/prisma/src/playwright";

export default async function globalTeardown() {
  await createTemplateDatabase();
}
