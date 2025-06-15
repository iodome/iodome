// src/playwright/fixtures.ts
import { test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// src/playwright/server.ts
import { execSync, spawn } from "child_process";
import http from "http";

// src/config.ts
import { loadConfig } from "@iodome/core";

// src/playwright/server.ts
var TestServer = class {
  constructor(id) {
    this.id = id.replace("-", "_");
    this.port = Math.floor(Math.random() * (39999 - 30001 + 1)) + 30001;
    this.dbName = "";
  }
  async setup() {
    const config = await loadConfig();
    this.dbName = `${config.applicationName}_test`;
    this.setupDb();
    spawn("pnpm", ["start"], {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
        PORT: this.port.toString()
      },
      stdio: "ignore",
      detached: false
    });
    await this.waitForServerReady(this.port);
  }
  get url() {
    return process.env.DATABASE_URL?.replace(this.dbName, this.name);
  }
  get name() {
    return `${this.dbName}_${this.id}`;
  }
  setupDb() {
    execSync(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
			"
		`);
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`);
    execSync(`psql -U postgres -c "CREATE DATABASE ${this.name}"`);
    execSync(`DATABASE_URL=${this.url} pnpm prisma db push --accept-data-loss`);
  }
  async waitForServerReady(timeout = 3e4) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        const req = http.get(`http://127.0.0.1:${this.port}`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        });
        req.on("error", retry);
        req.end();
      };
      const retry = () => {
        if (Date.now() - start > timeout) {
          reject(
            new Error("Server did not become ready within the timeout period.")
          );
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
};

// src/playwright/fixtures.ts
import { expect } from "@playwright/test";
function url(testId) {
  const id = testId.replace("-", "_");
  return process.env.DATABASE_URL.replace("?", `_${id}?`);
}
var test = base.extend({
  baseURL: [
    async ({}, use, testInfo) => {
      const { testId } = testInfo;
      const server = new TestServer(testId);
      await server.setup();
      await use(`http://127.0.0.1:${server.port}`);
    },
    { scope: "test", timeout: 3e4 }
  ],
  prisma: [
    async ({}, use, testInfo) => {
      const { testId } = testInfo;
      const prisma = new PrismaClient({
        datasources: { db: { url: url(testId) } },
        log: process.env.DEBUG ? ["query", "info", "warn", "error"] : []
      });
      await use(prisma);
    },
    { scope: "test" }
  ]
});

// src/playwright/setup.ts
import { execSync as execSync2 } from "child_process";
function globalSetup() {
  console.log("playwright testing...");
  console.time("next build");
  execSync2("pnpm build", { stdio: "ignore" });
  console.timeEnd("next build");
}
var setup_default = globalSetup;

// src/playwright/teardown.ts
import { execSync as execSync3 } from "child_process";
async function dropDatabasesStartingWith(prefix, appName) {
  const result = execSync3(
    `
		psql -U postgres -t -c "
			SELECT datname
			FROM pg_database
			WHERE datname LIKE '${prefix}%';
		"
	`,
    { encoding: "utf-8" }
  );
  const databases = result.split("\n").map((db) => db.replace(/│/g, "").trim()).filter((db) => db.length > 0).filter((db) => db.includes(`${appName}_test_`));
  databases.forEach((db) => {
    execSync3(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${db}' AND pid <> pg_backend_pid();
			"
		`);
    execSync3(`psql -U postgres -c "DROP DATABASE IF EXISTS ${db};"`);
  });
}
async function globalTeardown() {
  const config = await loadConfig();
  await dropDatabasesStartingWith(
    `${config.applicationName}_test_`,
    config.applicationName
  );
}
export {
  expect,
  setup_default as globalSetup,
  globalTeardown,
  test
};
