// src/playwright/fixtures.ts
import { test as base } from "@playwright/test";

// src/utils/server.ts
import { spawn } from "child_process";
import http from "http";
import * as net from "net";

// src/playwright/utils.ts
import { createHash } from "crypto";
import { readFileSync } from "fs";
import * as path from "path";
function getSchemaPath() {
  const schemaFlagIndex = process.argv.indexOf("--schema");
  if (schemaFlagIndex !== -1 && process.argv[schemaFlagIndex + 1]) {
    return path.resolve(process.argv[schemaFlagIndex + 1]);
  }
  if (process.env.PRISMA_SCHEMA_PATH) {
    return path.resolve(process.env.PRISMA_SCHEMA_PATH);
  }
  return path.join(process.cwd(), "prisma", "schema.prisma");
}
function getTemplateDbName() {
  try {
    const schemaPath = getSchemaPath();
    const schemaContent = readFileSync(schemaPath, "utf8");
    const hash = createHash("sha256").update(schemaContent).digest("hex").slice(0, 8);
    return `iodome_tpl_${hash}`;
  } catch (e) {
    return `iodome_tpl_default`;
  }
}

// src/utils/logger.ts
var Logger = class {
  static print = !!process.env.IODOME_DEBUG;
  static log(...args) {
    if (this.print) console.log("[iodome][LOG]", ...args);
  }
  static warn(...args) {
    if (this.print) console.warn("[iodome][WARN]", ...args);
  }
  static error(...args) {
    if (this.print) console.error("[iodome][ERROR]", ...args);
  }
};

// src/utils/postgres-client.ts
import { execSync } from "child_process";
var PostgresClient = class {
  static checkIfPostgresExists() {
    try {
      execSync("psql -U postgres -c 'SELECT 1'", { stdio: "ignore" });
      return true;
    } catch (e) {
      return false;
    }
  }
  static checkIfTemplateExists(name) {
    const result = execSync(
      `psql -U postgres -tA -c "SELECT 1 FROM pg_database WHERE datname='${name}'"`,
      { encoding: "utf8", stdio: "pipe" }
    ).toString().trim();
    const exists = result.includes("1");
    Logger.log(
      `Template existence check result: "${result}", exists: ${exists}`
    );
    return exists;
  }
  static createDatabase(name, url2) {
    Logger.log(`Creating database ${name}`);
    execSync(`psql -U postgres -c "CREATE DATABASE ${name}"`, {
      stdio: "ignore"
    });
    Logger.log(`Running Prisma migrations for ${name}`);
    execSync(`DATABASE_URL=${url2} pnpm prisma db push --accept-data-loss`, {
      stdio: "ignore"
    });
  }
  static createDatabaseFromTemplate(name, templateName) {
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
  static dropDatabaseIfExists(name) {
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${name}"`, {
      stdio: "ignore"
    });
    Logger.log(`Dropped test database: ${name}`);
  }
  static disconnectAllConnections(name) {
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
};

// src/utils/server.ts
var TestServer = class _TestServer {
  id;
  port;
  dbName;
  cmd;
  server;
  static instances = /* @__PURE__ */ new Set();
  static cleanupSetup = false;
  static templateDbName = null;
  static templateReady = false;
  constructor(id) {
    this.id = id.replace("-", "_");
    this.port = 0;
    this.dbName = "iodome_test";
    this.cmd = process.env.CI || process.env.IODOME_BUILD ? "start" : "dev";
    _TestServer.instances.add(this);
    this.setupGlobalCleanup();
  }
  async setup() {
    this.port = await this.getFreePort();
    await this.setupDb();
    Logger.log(`Starting server for test ${this.id} on port ${this.port}`);
    this.server = spawn("pnpm", [this.cmd], {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
        PORT: this.port.toString()
      },
      stdio: "ignore",
      detached: process.platform !== "win32"
    });
    Logger.log(`Server process ${this.server.pid} started for test ${this.id}`);
    await this.waitForServerReady(this.port);
    Logger.log(`Server ready for test ${this.id}`);
  }
  setupGlobalCleanup() {
    if (_TestServer.cleanupSetup) {
      return;
    }
    _TestServer.cleanupSetup = true;
    const cleanup = () => {
      const instanceCount = _TestServer.instances.size;
      if (instanceCount > 0) {
        Logger.log(
          `Cleaning up ${instanceCount} test server${instanceCount === 1 ? "" : "s"}...`
        );
      }
      _TestServer.instances.forEach((instance) => {
        instance.cleanup();
      });
    };
    process.once("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.once("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
    process.once("exit", cleanup);
    process.once("uncaughtException", (err) => {
      console.error("Uncaught exception:", err);
      cleanup();
      process.exit(1);
    });
    process.once("unhandledRejection", (err) => {
      console.error("Unhandled rejection:", err);
      cleanup();
      process.exit(1);
    });
  }
  async cleanup() {
    _TestServer.instances.delete(this);
    if (this.server && !this.server.killed) {
      Logger.log(`Killing server process ${this.server.pid}`);
      try {
        if (this.server.pid) {
          process.kill(-this.server.pid, "SIGTERM");
        }
      } catch (e) {
        this.server.kill("SIGTERM");
      }
      setTimeout(() => {
        if (this.server && !this.server.killed) {
          try {
            if (this.server.pid) {
              process.kill(-this.server.pid, "SIGKILL");
            }
          } catch (e) {
            this.server.kill("SIGKILL");
          }
        }
      }, 2e3);
    }
    this.cleanupDb();
  }
  get url() {
    return `postgresql://postgres:postgres@localhost:5432/${this.name}?schema=public`;
  }
  get name() {
    return `${this.dbName}_${this.id}`;
  }
  async getFreePort() {
    return new Promise((resolve2, reject) => {
      const server = net.createServer();
      server.listen(0, () => {
        const address = server.address();
        server.close();
        if (address && typeof address === "object") {
          resolve2(address.port);
        } else {
          reject(new Error("Failed to acquire free port"));
        }
      });
    });
  }
  static getTemplateDbNameCached() {
    if (_TestServer.templateDbName) {
      return _TestServer.templateDbName;
    }
    _TestServer.templateDbName = getTemplateDbName();
    return _TestServer.templateDbName;
  }
  static checkTemplateExists() {
    if (_TestServer.templateReady) {
      return true;
    }
    const templateName = _TestServer.getTemplateDbNameCached();
    try {
      _TestServer.templateReady = PostgresClient.checkIfTemplateExists(templateName);
      return _TestServer.templateReady;
    } catch (e) {
      return false;
    }
  }
  async setupDb() {
    PostgresClient.disconnectAllConnections(this.name);
    PostgresClient.dropDatabaseIfExists(this.name);
    const hasTemplate = _TestServer.checkTemplateExists();
    Logger.log(`
      Template exists: ${hasTemplate},
      template name: ${_TestServer.templateDbName}
      `);
    if (hasTemplate && _TestServer.templateDbName) {
      try {
        PostgresClient.createDatabaseFromTemplate(
          this.name,
          _TestServer.templateDbName
        );
      } catch (e) {
        Logger.log(`Template creation failed, falling back to regular setup`);
        PostgresClient.createDatabase(this.name, this.url);
      }
    } else {
      PostgresClient.createDatabase(this.name, this.url);
    }
    Logger.log(`Database setup complete for ${this.name}`);
  }
  cleanupDb() {
    try {
      PostgresClient.disconnectAllConnections(this.name);
      PostgresClient.dropDatabaseIfExists(this.name);
    } catch (e) {
      Logger.warn(`Failed to drop test database ${this.name}:`, e);
    }
  }
  async waitForServerReady(timeout = 6e4) {
    const start = Date.now();
    return new Promise((resolve2, reject) => {
      const check = () => {
        const req = http.get(`http://127.0.0.1:${this.port}`, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve2();
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
            new Error(
              "Dev server did not become ready within the timeout period."
            )
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
function url(testId) {
  const id = testId.replace("-", "_");
  return `postgresql://postgres:postgres@localhost:5432/iodome_test_${id}?schema=public`;
}
function createTestFixtures(PrismaClientConstructor) {
  return base.extend({
    baseURL: [
      async ({}, use, testInfo) => {
        const { testId } = testInfo;
        const server = new TestServer(testId);
        await server.setup();
        await use(`http://127.0.0.1:${server.port}`);
        await server.cleanup();
      },
      { scope: "test", timeout: 3e4 }
    ],
    prisma: [
      async ({}, use, testInfo) => {
        const { testId } = testInfo;
        const prisma = new PrismaClientConstructor({
          datasources: { db: { url: url(testId) } },
          log: process.env.DEBUG ? ["query", "info", "warn", "error"] : []
        });
        await use(prisma);
      },
      { scope: "test" }
    ]
  });
}

// src/playwright/teardown.ts
async function dropDatabases() {
  const result = PostgresClient.dropIodomeDatabases();
  const databases = result.split("\n").map((db) => db.replace(/│/g, "").trim()).filter((db) => db.length > 0).filter((db) => db.includes("iodome_test"));
  databases.forEach((db) => {
    PostgresClient.disconnectAllConnections(db);
    PostgresClient.dropDatabaseIfExists(db);
  });
}

// src/vitest/index.ts
import { afterEach, beforeEach } from "vitest";
function useTransactions(prisma) {
  beforeEach(async () => {
    await prisma.$queryRaw`BEGIN;`;
  });
  afterEach(async () => {
    await prisma.$queryRaw`ROLLBACK;`;
  });
}
export {
  createTestFixtures,
  dropDatabases,
  useTransactions
};
