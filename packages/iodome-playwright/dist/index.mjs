var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/fixtures.ts
import { test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// src/server.ts
import { execSync, spawn } from "child_process";
import http from "http";

// src/config.ts
import path from "path";
import { pathToFileURL } from "url";
var cachedConfig = null;
function loadConfig() {
  return __async(this, null, function* () {
    if (cachedConfig) {
      return cachedConfig;
    }
    const configPath = path.join(process.cwd(), "iodome.config.ts");
    try {
      const configUrl = pathToFileURL(configPath).href;
      const configModule = yield import(configUrl);
      cachedConfig = configModule.default || configModule;
      return cachedConfig;
    } catch (error) {
      throw new Error(
        `Failed to load iodome.config.ts from ${configPath}. Make sure the file exists and exports a valid configuration object.`
      );
    }
  });
}

// src/server.ts
var TestServer = class {
  constructor(id) {
    this.id = id.replace("-", "_");
    this.port = Math.floor(Math.random() * (39999 - 30001 + 1)) + 30001;
    this.dbName = "";
  }
  setup() {
    return __async(this, null, function* () {
      const config = yield loadConfig();
      this.dbName = `${config.applicationName}_test`;
      this.setupDb();
      spawn("pnpm", ["start"], {
        env: __spreadProps(__spreadValues({}, process.env), {
          DATABASE_URL: this.url,
          PORT: this.port.toString()
        }),
        stdio: "ignore",
        detached: false
      });
      yield this.waitForServerReady(this.port);
    });
  }
  get url() {
    var _a;
    return (_a = process.env.DATABASE_URL) == null ? void 0 : _a.replace(this.dbName, this.name);
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
  waitForServerReady(timeout = 3e4) {
    return __async(this, null, function* () {
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
    });
  }
};

// src/fixtures.ts
import { expect } from "@playwright/test";
function url(testId) {
  const id = testId.replace("-", "_");
  return process.env.DATABASE_URL.replace("?", `_${id}?`);
}
var test = base.extend({
  baseURL: [
    (_0, _1, _2) => __async(null, [_0, _1, _2], function* ({}, use, testInfo) {
      const { testId } = testInfo;
      const server = new TestServer(testId);
      yield server.setup();
      yield use(`http://127.0.0.1:${server.port}`);
    }),
    { scope: "test", timeout: 3e4 }
  ],
  prisma: [
    (_0, _1, _2) => __async(null, [_0, _1, _2], function* ({}, use, testInfo) {
      const { testId } = testInfo;
      const prisma = new PrismaClient({
        datasources: { db: { url: url(testId) } },
        log: process.env.DEBUG ? ["query", "info", "warn", "error"] : []
      });
      yield use(prisma);
    }),
    { scope: "test" }
  ]
});

// src/setup.ts
import { execSync as execSync2 } from "child_process";
function globalSetup() {
  console.log("playwright testing...");
  console.time("next build");
  execSync2("pnpm build", { stdio: "ignore" });
  console.timeEnd("next build");
}
var setup_default = globalSetup;

// src/teardown.ts
import { execSync as execSync3 } from "child_process";
function dropDatabasesStartingWith(prefix, appName) {
  return __async(this, null, function* () {
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
  });
}
function globalTeardown() {
  return __async(this, null, function* () {
    const config = yield loadConfig();
    yield dropDatabasesStartingWith(`${config.applicationName}_test_`, config.applicationName);
  });
}
export {
  expect,
  setup_default as globalSetup,
  globalTeardown,
  test
};
