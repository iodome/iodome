import { createHash } from "crypto";
import { readFileSync } from "fs";
import * as path from "path";
import PostgresClient from "../utils/postgres-client";

export function getSchemaPath(): string {
  // Check for --schema flag in process args
  const schemaFlagIndex = process.argv.indexOf("--schema");
  if (schemaFlagIndex !== -1 && process.argv[schemaFlagIndex + 1]) {
    return path.resolve(process.argv[schemaFlagIndex + 1]);
  }

  // Check DRIZZLE_SCHEMA_PATH env var
  if (process.env.DRIZZLE_SCHEMA_PATH) {
    return path.resolve(process.env.DRIZZLE_SCHEMA_PATH);
  }

  // Default location
  return path.join(process.cwd(), "db", "schema.ts");
}

export function getTemplateDbName(): string {
  try {
    const schemaPath = getSchemaPath();
    const schemaContent = readFileSync(schemaPath, "utf8");
    const hash = createHash("sha256")
      .update(schemaContent)
      .digest("hex")
      .slice(0, 8);
    return `iodome_tpl_${hash}`;
  } catch (e) {
    return `iodome_tpl_default`;
  }
}
