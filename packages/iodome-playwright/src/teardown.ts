import { execSync } from "child_process";
import { loadConfig } from "./config";

async function dropDatabasesStartingWith(prefix: string, appName: string) {
  const result = execSync(
    `
		psql -U postgres -t -c "
			SELECT datname
			FROM pg_database
			WHERE datname LIKE '${prefix}%';
		"
	`,
    { encoding: "utf-8" },
  );

  const databases = result
    .split("\n")
    .map((db: string) => db.replace(/│/g, "").trim())
    .filter((db: string) => db.length > 0)
    .filter((db: string) => db.includes(`${appName}_test_`));

  databases.forEach((db: string) => {
    execSync(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${db}' AND pid <> pg_backend_pid();
			"
		`);
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${db};"`);
  });
}

export default async function globalTeardown() {
  const config = await loadConfig();
  await dropDatabasesStartingWith(
    `${config.applicationName}_test_`,
    config.applicationName,
  );
}
