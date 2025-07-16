import { dropDatabases } from "./teardown";

export default async function globalTeardown() {
  await dropDatabases();
}