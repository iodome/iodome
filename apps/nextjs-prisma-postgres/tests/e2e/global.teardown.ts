import { dropDatabases } from "@iodome/prisma";

export default async function globalTeardown() {
  await dropDatabases();
}
