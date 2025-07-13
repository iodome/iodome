import { execSync } from "child_process";

async function dropDatabases() {
  const result = execSync(
    `
		psql -U postgres -t -c "
			SELECT datname
			FROM pg_database
			WHERE datname LIKE 'iodome_test%';
		"
	`,
    { encoding: "utf-8" }
  );

  const databases = result
    .split("\n")
    .map((db: string) => db.replace(/│/g, "").trim())
    .filter((db: string) => db.length > 0)
    .filter((db: string) => db.includes("iodome_test"));

  databases.forEach((db: string) => {
    execSync(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${db}' AND pid <> pg_backend_pid();
			"
		`, { stdio: 'ignore' });
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS \"${db}\"";`, { stdio: 'ignore' });
  });
}

export { dropDatabases };
