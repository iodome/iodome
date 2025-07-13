import { execSync } from "child_process";
import PostgresClient from "../utils/postgres-client";

async function dropDatabases() {
  const result = PostgresClient.dropIodomeDatabases();
  const databases = result
    .split("\n")
    .map((db: string) => db.replace(/│/g, "").trim())
    .filter((db: string) => db.length > 0)
    .filter((db: string) => db.includes("iodome_test"));

  databases.forEach((db: string) => {
    PostgresClient.disconnectAllConnections(db);
    PostgresClient.dropDatabaseIfExists(db);
  });
}

export { dropDatabases };
