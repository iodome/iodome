import { dropDatabases } from "@iodome/drizzle/playwright";

export default async function globalTeardown() {
  await dropDatabases();
}
