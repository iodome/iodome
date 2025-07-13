import { dropDatabases } from "@iodome/prisma/playwright";

export default async function globalTeardown() {
  await dropDatabases();
}
