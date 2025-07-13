import { execSync } from "child_process";
import Logger from "./logger";

export default class PostgresClient {
  static checkIfPostgresExists() {
    try {
      execSync("psql -U postgres -c 'SELECT 1'", { stdio: "ignore" });
      return true;
    } catch (e) {
      return false;
    }
  }

  static checkIfTemplateExists(name: string) {
    const result = execSync(
      `psql -U postgres -tA -c "SELECT 1 FROM pg_database WHERE datname='${name}'"`,
      { encoding: "utf8", stdio: "pipe" }
    )
      .toString()
      .trim();
    const exists = result.includes("1");
    Logger.log(
      `Template existence check result: "${result}", exists: ${exists}`
    );
    return exists;
  }

  static createDatabase(name: string, url: string) {
    Logger.log(`Creating database ${name}`);
    execSync(`psql -U postgres -c "CREATE DATABASE ${name}"`, {
      stdio: "ignore",
    });
    Logger.log(`Running Prisma migrations for ${name}`);
    execSync(`DATABASE_URL=${url} pnpm prisma db push --accept-data-loss`, {
      stdio: "ignore",
    });
  }

  static createDatabaseFromTemplate(name: string, templateName: string) {
    Logger.log(`Creating database ${name} using template ${templateName}`);
    execSync(
      `psql -U postgres -c "CREATE DATABASE ${name} TEMPLATE ${templateName}"`,
      { stdio: "ignore" }
    );
    Logger.log(`Database created from template for ${name}`);
  }

  static dropIodomeDatabases() {
    return execSync(
      `
		psql -U postgres -t -c "
			SELECT datname
			FROM pg_database
			WHERE datname LIKE 'iodome_test%';
		"
	`,
      { encoding: "utf-8" }
    );
  }

  static dropDatabaseIfExists(name: string) {
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${name}"`, {
      stdio: "ignore",
    });
    Logger.log(`Dropped test database: ${name}`);
  }

  static disconnectAllConnections(name: string) {
    execSync(
      `
        psql -U postgres -c "
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = '${name}' AND pid <> pg_backend_pid();
        "
      `,
      { stdio: "ignore" }
    );
  }
}
